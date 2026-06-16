import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import * as QRCode from 'qrcode';
import { DataSource, Repository } from 'typeorm';
import { Product, ProductStatus } from '../../domain/products/product.entity';
import { Order, OrderStatus } from '../../domain/orders/order.entity';
import { CreateOrderDto } from './dto';
import { OrderNumberService } from './order-number.service';
import { UniqueAmountService } from '../payments/unique-amount.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ds: DataSource,
    private readonly config: ConfigService,
    private readonly numbers: OrderNumberService,
    private readonly amounts: UniqueAmountService,
    @InjectRepository(Order) private readonly orders: Repository<Order>
  ) {}

  async create(userId: number, dto: CreateOrderDto) {
    const orderNo = await this.numbers.next();
    const receiveAddress = this.config.get<string>('defaultReceiveAddress')!;
    const expireMinutes = this.config.get<number>('paymentExpireMinutes') || 30;
    return this.ds.transaction(async (manager) => {
      const product = await manager.findOne(Product, { where: { id: dto.productId }, lock: { mode: 'pessimistic_write' } });
      if (!product || product.status !== ProductStatus.ACTIVE) throw new NotFoundException('product not found');
      if (product.stock < dto.quantity) throw new BadRequestException('insufficient stock');
      product.stock -= dto.quantity;
      await manager.save(product);
      const productAmount = new Decimal(product.price).mul(dto.quantity).toFixed(2);
      const payAmount = await this.amounts.reserve(productAmount);
      const expiresAt = new Date(Date.now() + expireMinutes * 60_000);
      const tronUri = `tron:${receiveAddress}?amount=${payAmount}&token=USDT`;
      const qrCodeDataUrl = await QRCode.toDataURL(tronUri);
      const order = manager.create(Order, {
        orderNo,
        userId,
        productId: product.id,
        quantity: dto.quantity,
        productAmount,
        payAmount,
        payAddress: receiveAddress,
        expiresAt,
        qrCodeDataUrl
      });
      return manager.save(order);
    });
  }

  async getForUser(userId: number, id: number) {
    const order = await this.orders.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('order not found');
    return order;
  }

  async getPaymentStatus(userId: number, orderNo: string) {
    const order = await this.orders.findOne({ where: { orderNo, userId } });
    if (!order) throw new NotFoundException('order not found');
    return { orderNo: order.orderNo, status: order.status, payAmount: order.payAmount, payAddress: order.payAddress, expiresAt: order.expiresAt };
  }

  async cancelExpired() {
    const expired = await this.orders.find({ where: { status: OrderStatus.PENDING_PAYMENT }, order: { expiresAt: 'ASC' }, take: 500 });
    const now = Date.now();
    for (const order of expired.filter((o) => o.expiresAt.getTime() <= now)) {
      await this.ds.transaction(async (manager) => {
        const current = await manager.findOne(Order, { where: { id: order.id }, lock: { mode: 'pessimistic_write' } });
        if (!current || current.status !== OrderStatus.PENDING_PAYMENT || current.expiresAt.getTime() > now) return;
        current.status = OrderStatus.CANCELLED;
        current.cancelledAt = new Date();
        await manager.increment(Product, { id: current.productId }, 'stock', current.quantity);
        await manager.save(current);
        await this.amounts.release(current.payAmount);
      });
    }
  }
}
