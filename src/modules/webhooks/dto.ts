import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  txid: string;

  @IsString()
  fromAddress: string;

  @IsString()
  toAddress: string;

  @IsNumberString()
  amount: string;

  @IsOptional()
  blockNumber?: number;
}
