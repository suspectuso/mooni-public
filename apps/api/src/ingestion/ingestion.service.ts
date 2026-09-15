import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface ApprovePlaceInput {
  name: string
  description?: string
  categorySlug: string
  district?: string
  lat?: number
  lng?: number
  tags?: string[]
  moodTags?: string[]
  photos?: string[]
  priceLevel?: number
}

export interface RawPostInput {
  source: string
  externalId: string
  text: string
  mediaUrls?: string[]
  // структурная подсказка AI/OSM-пайплайна (n8n) — модератор апрувит её одним кликом
  suggestion?: Partial<ApprovePlaceInput>
}

/**
 * Слой ingestion (§9 архитектуры): n8n шлёт сырые посты сюда → raw_post (status=new).
 * В боевой каталог place попадает ТОЛЬКО после ручного апрува (модерации).
 */
@Injectable()
export class IngestionService {
  constructor(private prisma: PrismaService) {}

  async ingest(input: RawPostInput) {
    const post = await this.prisma.rawPost.upsert({
      where: {
        source_externalId: {
          source: input.source,
          externalId: input.externalId,
        },
      },
      update: {
        text: input.text,
        mediaUrls: input.mediaUrls ?? [],
        suggestion: input.suggestion ?? undefined,
      },
      create: {
        source: input.source,
        externalId: input.externalId,
        text: input.text,
        mediaUrls: input.mediaUrls ?? [],
        suggestion: input.suggestion ?? undefined,
      },
    })
    return { ok: true, id: post.id, status: post.status }
  }

  async pending(limit = 50) {
    return this.prisma.rawPost.findMany({
      where: { status: 'new' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async approve(rawPostId: string, place: ApprovePlaceInput) {
    const category = await this.prisma.placeCategory.findUnique({
      where: { slug: place.categorySlug },
    })
    if (!category) throw new Error(`Unknown category: ${place.categorySlug}`)

    const created = await this.prisma.place.create({
      data: {
        name: place.name,
        description: place.description ?? null,
        categoryId: category.id,
        district: place.district ?? null,
        lat: place.lat ?? null,
        lng: place.lng ?? null,
        tags: place.tags ?? [],
        moodTags: place.moodTags ?? [],
        photos: place.photos ?? [],
        priceLevel: place.priceLevel ?? null,
        source: 'ingestion',
      },
    })
    await this.prisma.rawPost.update({
      where: { id: rawPostId },
      data: { status: 'processed', placeId: created.id },
    })
    return { ok: true, placeId: created.id }
  }

  async reject(rawPostId: string) {
    await this.prisma.rawPost.update({
      where: { id: rawPostId },
      data: { status: 'rejected' },
    })
    return { ok: true }
  }
}
