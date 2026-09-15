/**
 * Чистая логика платежей — разбор вебхуков ЮKassa / xRocket, без сети/БД.
 */

/** ЮKassa: оплачен ли вебхук. */
export function isYooKassaPaid(body: any): boolean {
  return (
    body?.event === 'payment.succeeded' || body?.object?.status === 'succeeded'
  )
}

/** ЮKassa: наш paymentId кладём в metadata.paymentId. */
export function extractYooKassaPaymentId(body: any): string | null {
  return body?.object?.metadata?.paymentId ?? null
}

/** xRocket: оплачен ли вебхук (invoicePay / status=paid). */
export function isXRocketPaid(body: any): boolean {
  return (
    body?.type === 'invoicePay' ||
    body?.data?.status === 'paid' ||
    body?.status === 'paid'
  )
}

/** xRocket: наш paymentId кладём в payload инвойса. */
export function extractXRocketPaymentId(body: any): string | null {
  return body?.data?.payload ?? body?.payload ?? null
}
