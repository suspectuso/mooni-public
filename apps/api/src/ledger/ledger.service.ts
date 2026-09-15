import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export type LedgerKind = 'susCoin' | 'xp'

/**
 * Аудит-леджер баланса: каждое изменение susCoin/xp фиксируется отдельной записью.
 * Пишется рядом с инкрементом (трейсинг/анти-фрод/дебаг расхождений баланса).
 */
@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  /** Записать одно или несколько изменений баланса с общей причиной. */
  async record(
    userId: string,
    entries: { kind: LedgerKind; delta: number }[],
    reason: string,
    refId?: string,
  ) {
    const data = entries
      .filter((e) => e.delta !== 0)
      .map((e) => ({
        userId,
        kind: e.kind,
        delta: e.delta,
        reason,
        refId: refId ?? null,
      }))
    if (data.length) await this.prisma.balanceLedger.createMany({ data })
  }
}
