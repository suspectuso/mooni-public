import { Injectable, Logger } from '@nestjs/common'

export interface XRocketInvoice {
  invoiceId: string
  link: string
  status: string
}

/** xRocket (крипто, как в crocopay). POST /tg-invoices, заголовок Rocket-Pay-Key, USDT. */
@Injectable()
export class XRocketService {
  private readonly logger = new Logger(XRocketService.name)
  private readonly token = process.env.XROCKET_TOKEN ?? ''
  private readonly baseUrl =
    process.env.XROCKET_BASE_URL ?? 'https://pay.xrocket.tg'

  get configured() {
    return !!this.token
  }

  async createInvoice(
    amountUsd: number,
    payload: string,
    callbackUrl: string,
    returnUrl: string,
  ): Promise<XRocketInvoice> {
    const res = await fetch(`${this.baseUrl}/tg-invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Rocket-Pay-Key': this.token,
      },
      body: JSON.stringify({
        currency: 'USDT',
        amount: amountUsd,
        numPayments: 1,
        description: 'Mooni',
        payload,
        callbackUrl,
        returnUrl,
      }),
    })
    const ar: any = await res.json()
    if (!ar?.success) {
      this.logger.error(`xRocket error: ${JSON.stringify(ar)}`)
      throw new Error(ar?.message || 'xRocket error')
    }
    const inv = ar.data
    return {
      invoiceId: String(inv.id),
      link: inv.link ?? '',
      status: inv.status ?? 'active',
    }
  }
}
