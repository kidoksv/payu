import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list() {
    return this.products.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.products.detail(Number(id));
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product:write')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product:write')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(Number(id), dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product:write')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(Number(id));
  }
}
