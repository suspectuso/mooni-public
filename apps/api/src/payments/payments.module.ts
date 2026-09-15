import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { PaymentsController } from './payments.controller'
import { YooKassaService } from './yookassa.service'
import { XRocketService } from './xrocket.service'

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, YooKassaService, XRocketService],
})
export class PaymentsModule {}
