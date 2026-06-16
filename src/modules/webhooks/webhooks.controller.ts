import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SignatureGuard } from '../../common/guards/signature.guard';
import { PaymentsService } from '../payments/payments.service';
import { PaymentWebhookDto } from './dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(SignatureGuard)
  @Post('payment')
  payment(@Body() dto: PaymentWebhookDto) {
    return this.payments.handleTransfer({ ...dto, raw: dto });
  }
}
