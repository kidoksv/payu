import { IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
