import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get('order/:orderId')
  byOrder(@Param('orderId') orderId: string) {
    return this.payments.listByOrder(Number(orderId));
  }

  @Get('my')
  mine(@CurrentUser() user: { id: number }) {
    return this.payments.listForUser(user.id);
  }
}
