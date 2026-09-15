/**
 * Чистая логика Random Coffee — выбор партнёра из очереди ожидающих. Без БД.
 */

export interface WaitingReq {
  id: string
  userId: string
  createdAt: Date | string
}

/** Берём самого «старого» ожидающего, кроме себя. null — пары нет. */
export function pickMatch(
  waiting: WaitingReq[],
  selfUserId: string,
): WaitingReq | null {
  const others = waiting
    .filter((w) => w.userId !== selfUserId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  return others[0] ?? null
}
