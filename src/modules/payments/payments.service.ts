import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Order, OrderStatus } from '../../domain/orders/order.entity';
import { Product } from '../../domain/products/product.entity';
import { Payment, PaymentStatus } from '../../domain/payments/payment.entity';
import { PaymentLog, PaymentLogLevel } from '../../domain/payments/payment-log.entity';
import { ChainTransaction } from '../../domain/payments/transaction.entity';
import { Trc20Transfer } from '../../infrastructure/tron/tron.types';
import { UniqueAmountService } from './unique-amount.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly ds: DataSource,
    private readonly config: ConfigService,
    private readonly amounts: UniqueAmountService,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(PaymentLog) private readonly logs: Repository<PaymentLog>,
    @InjectRepository(Order) private readonly orders: Repository<Order>
  ) {}

  async handleTransfer(transfer: Trc20Transfer) {
    return this.ds.transaction(async (manager) => {
      const paymentExists = await manager.findOne(Payment, { where: { txid: transfer.txid } });
      if (paymentExists) {
        await manager.save(
          manager.create(PaymentLog, {
            orderId: paymentExists.orderId,
            txid: transfer.txid,
            level: PaymentLogLevel.WARN,
            event: 'DUPLICATE_TX',
            message: 'duplicate confirmed payment ignored',
            context: transfer
          })
        );
        return { matched: true, duplicate: true, orderId: paymentExists.orderId };
      }

      const txExists = await manager.exists(ChainTransaction, { where: { txid: transfer.txid } });
      if (!txExists) {
        await manager.save(
          manager.create(ChainTransaction, {
            txid: transfer.txid,
            fromAddress: transfer.fromAddress,
            toAddress: transfer.toAddress,
            amount: transfer.amount,
            blockNumber: transfer.blockNumber,
            blockTimestamp: transfer.blockTimestamp,
            rawJson: transfer.raw
          })
        );
      } else {
        await manager.save(
          manager.create(PaymentLog, {
            txid: transfer.txid,
            level: PaymentLogLevel.INFO,
            event: 'REPROCESS_TX',
            message: 'existing chain transaction has no payment record, retrying order match',
            context: transfer
          })
        );
      }

      return this.confirmTransfer(manager, transfer);
    });
  }

  private async confirmTransfer(manager: EntityManager, transfer: Trc20Transfer) {
    const minConfirmations = this.config.get<number>('minConfirmations') || 1;
    const confirmations = minConfirmations;
    const order = await manager.findOne(Order, {
      where: { payAddress: transfer.toAddress, payAmount: new Decimal(transfer.amount).toFixed(2), status: In([OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED]) },
      lock: { mode: 'pessimistic_write' }
    });

    if (!order) {
      await manager.save(manager.create(PaymentLog, { txid: transfer.txid, level: PaymentLogLevel.WARN, event: 'NO_MATCH', message: 'no pending order matched transfer amount', context: transfer }));
      return { matched: false };
    }
    const transferTime = transfer.blockTimestamp || new Date();
    if (order.expiresAt.getTime() < transferTime.getTime()) {
      await manager.save(manager.create(PaymentLog, { orderId: order.id, txid: transfer.txid, level: PaymentLogLevel.WARN, event: 'EXPIRED_PAYMENT', message: 'transfer arrived after order expiration', context: transfer }));
      return { matched: false };
    }
    if (!new Decimal(order.payAmount).equals(new Decimal(transfer.amount).toDecimalPlaces(2))) {
      throw new BadRequestException('amount mismatch');
    }

    const payment = manager.create(Payment, {
      orderId: order.id,
      txid: transfer.txid,
      fromAddress: transfer.fromAddress,
      toAddress: transfer.toAddress,
      amount: transfer.amount,
      blockNumber: transfer.blockNumber,
      confirmations,
      status: confirmations >= minConfirmations ? PaymentStatus.CONFIRMED : PaymentStatus.PENDING,
      paidAt: transferTime
    });
    await manager.save(payment);

    if (order.status === OrderStatus.CANCELLED) {
      await manager.decrement(Product, { id: order.productId }, 'stock', order.quantity);
    }
    order.status = OrderStatus.PAID;
    order.paidAt = transferTime;
    order.cancelledAt = undefined;
    await manager.save(order);
    await this.amounts.release(order.payAmount);
    await manager.save(manager.create(PaymentLog, { orderId: order.id, txid: transfer.txid, level: PaymentLogLevel.INFO, event: 'PAYMENT_CONFIRMED', message: 'payment confirmed', context: transfer }));
    this.logger.log(`order ${order.orderNo} paid by tx ${transfer.txid}`);
    return { matched: true, orderNo: order.orderNo };
  }

  listByOrder(orderId: number) {
    return this.payments.find({ where: { orderId }, order: { id: 'DESC' } });
  }

  async listForUser(userId: number) {
    const orders = await this.orders.find({ where: { userId }, select: ['id'] });
    if (!orders.length) return [];
    return this.payments
      .createQueryBuilder('payment')
      .where('payment.order_id IN (:...ids)', { ids: orders.map((order) => order.id) })
      .orderBy('payment.id', 'DESC')
      .limit(100)
      .getMany();
  }

  listLogs() {
    return this.logs.find({ order: { id: 'DESC' }, take: 200 });
  }
}
