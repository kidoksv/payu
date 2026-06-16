import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../../domain/products/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly products: Repository<Product>) {}

  list() {
    return this.products.find({ where: { status: ProductStatus.ACTIVE }, order: { id: 'DESC' } });
  }

  async detail(id: number) {
    const product = await this.products.findOne({ where: { id } });
    if (!product) throw new NotFoundException('product not found');
    return product;
  }

  create(dto: CreateProductDto) {
    return this.products.save(this.products.create(dto));
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.detail(id);
    Object.assign(product, dto);
    return this.products.save(product);
  }

  async remove(id: number) {
    const product = await this.detail(id);
    product.status = ProductStatus.INACTIVE;
    return this.products.save(product);
  }
}
