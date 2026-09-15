import { Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'

const YOOKASSA_IP_RANGES = [
  '185.71.76.',
  '185.71.77.',
  '77.75.153.',
  '77.75.156.',
  '77.75.154.',
]

export interface YooKassaPayment {
  paymentId: string
  paymentUrl: string
  status: string
}

/** ЮKassa (как в Match). Создаёт платёж и отдаёт ссылку на оплату. */
@Injectable()
export class YooKassaService {
  private readonly logger = new Logger(YooKassaService.name)
  private readonly shopId = process.env.YOOKASSA_SHOP_ID ?? ''
  private readonly secretKey = process.env.YOOKASSA_API_KEY ?? ''
  private readonly apiUrl = 'https://api.yookassa.ru/v3'

  get configured() {
    return !!(this.shopId && this.secretKey)
  }

  async createPayment(
    amountRub: number,
    description: string,
    metadata: Record<string, string>,
    returnUrl: string,
  ): Promise<YooKassaPayment> {
    const res = await fetch(`${this.apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64'),
        'Idempotence-Key': randomUUID(),
      },
      body: JSON.stringify({
        amount: { value: amountRub.toFixed(2), currency: 'RUB' },
        confirmation: { type: 'redirect', return_url: returnUrl },
        capture: true,
        description,
        metadata,
      }),
    })
    const data: any = await res.json()
    if (!res.ok) {
      this.logger.error(`YooKassa error: ${JSON.stringify(data)}`)
      throw new Error(data.description || 'YooKassa error')
    }
    return {
      paymentId: data.id,
      paymentUrl: data.confirmation?.confirmation_url || '',
      status: data.status,
    }
  }

  verifyWebhookIp(ip: string): boolean {
    const clean = ip.replace(/^::ffff:/, '')
    return YOOKASSA_IP_RANGES.some((r) => clean.startsWith(r))
  }
}
