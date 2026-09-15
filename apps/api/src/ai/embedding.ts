/**
 * Чистая логика семантического подбора (Recommendation 2.0) — без сети/БД.
 */

/** Косинусное сходство двух векторов. 0 при несовпадении размерности/пустых. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

export interface EmbItem<T> {
  item: T
  embedding: number[] | null
}

/**
 * Ранжирует элементы по близости к query-вектору (по убыванию).
 * Элементы без эмбеддинга идут в конец (similarity = -1).
 */
export function rankByEmbedding<T>(
  items: EmbItem<T>[],
  query: number[],
  limit: number,
): T[] {
  return items
    .map(({ item, embedding }) => ({
      item,
      score: embedding ? cosineSimilarity(query, embedding) : -1,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item)
}
