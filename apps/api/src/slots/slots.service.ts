import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { CreateSlotInput, SlotCard } from '@mooni/shared'
import { PrismaService } from '../prisma/prisma.service'
import { BotService } from '../bot/bot.service'

/**
 * Коммьюнити-слоты (§ "Слоты" в fichi_i_mehaniki): сбор людей на активность.
 * Набралось min участников → статус confirmed (авто) + уведомление участникам через бота.
 */
@Injectable()
export class SlotsService {
  constructor(
    private prisma: PrismaService,
    private bot: BotService,
  ) {}

  async create(userId: string, input: CreateSlotInput): Promise<SlotCard> {
    if (input.maxParticipants < input.minParticipants) {
      throw new BadRequestException('max < min')
    }
    const slot = await this.prisma.activitySlot.create({
      data: {
        creatorId: userId,
        title: input.title,
        type: input.type,
        placeName: input.placeName ?? null,
        district: input.district ?? null,
        startsAt: new Date(input.startsAt),
        minParticipants: input.minParticipants,
        maxParticipants: input.maxParticipants,
        // создатель сразу участник
        participants: { create: { userId } },
      },
    })
    return this.get(userId, slot.id)
  }

  async listOpen(userId: string): Promise<SlotCard[]> {
    const slots = await this.prisma.activitySlot.findMany({
      where: {
        status: { in: ['open', 'confirmed'] },
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: 'asc' },
      include: { participants: { where: { status: 'joined' } } },
      take: 50,
    })
    return slots.map((s) => this.toCard(s, userId))
  }

  async mine(userId: string): Promise<SlotCard[]> {
    const slots = await this.prisma.activitySlot.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { participants: { some: { userId, status: 'joined' } } },
        ],
      },
      orderBy: { startsAt: 'asc' },
      include: { participants: { where: { status: 'joined' } } },
    })
    return slots.map((s) => this.toCard(s, userId))
  }

  async join(userId: string, slotId: string): Promise<SlotCard> {
    const slot = await this.prisma.activitySlot.findUnique({
      where: { id: slotId },
      include: { participants: { where: { status: 'joined' } } },
    })
    if (!slot) throw new NotFoundException('Slot not found')
    if (slot.participants.length >= slot.maxParticipants) {
      throw new BadRequestException('Slot is full')
    }

    await this.prisma.activityParticipant.upsert({
      where: { slotId_userId: { slotId, userId } },
      update: { status: 'joined' },
      create: { slotId, userId },
    })

    await this.recountStatus(slotId)
    return this.get(userId, slotId)
  }

  async leave(userId: string, slotId: string): Promise<SlotCard> {
    await this.prisma.activityParticipant.updateMany({
      where: { slotId, userId },
      data: { status: 'left' },
    })
    await this.recountStatus(slotId)
    return this.get(userId, slotId)
  }

  async get(userId: string, slotId: string): Promise<SlotCard> {
    const slot = await this.prisma.activitySlot.findUnique({
      where: { id: slotId },
      include: { participants: { where: { status: 'joined' } } },
    })
    if (!slot) throw new NotFoundException('Slot not found')
    return this.toCard(slot, userId)
  }

  /** Авто-подтверждение: набралось min → confirmed, упало ниже → снова open. */
  private async recountStatus(slotId: string) {
    const slot = await this.prisma.activitySlot.findUnique({
      where: { id: slotId },
      include: { participants: { where: { status: 'joined' } } },
    })
    if (!slot || slot.status === 'canceled' || slot.status === 'done') return
    const count = slot.participants.length
    const next = count >= slot.minParticipants ? 'confirmed' : 'open'
    if (next !== slot.status) {
      await this.prisma.activitySlot.update({
        where: { id: slotId },
        data: { status: next },
      })
      // набралась группа → уведомляем участников
      if (next === 'confirmed') {
        await this.notifyConfirmed(slotId)
      }
    }
  }

  private async notifyConfirmed(slotId: string) {
    const slot = await this.prisma.activitySlot.findUnique({
      where: { id: slotId },
      include: {
        participants: {
          where: { status: 'joined' },
          include: { user: { select: { telegramId: true } } },
        },
      },
    })
    if (!slot) return
    const when = slot.startsAt.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
    const text =
      `✅ Группа собралась!\n«${slot.title}» — ${when}` +
      (slot.district ? ` · ${slot.district}` : '') +
      `\nВас уже ${slot.participants.length}. До встречи!`
    await Promise.all(
      slot.participants.map((p) =>
        this.bot.sendMessage(p.user.telegramId, text),
      ),
    )
  }

  private toCard(
    slot: {
      id: string
      title: string
      type: string
      placeName: string | null
      district: string | null
      startsAt: Date
      minParticipants: number
      maxParticipants: number
      status: string
      creatorId: string
      participants: { userId: string }[]
    },
    userId: string,
  ): SlotCard {
    return {
      id: slot.id,
      title: slot.title,
      type: slot.type as SlotCard['type'],
      placeName: slot.placeName,
      district: slot.district,
      startsAt: slot.startsAt.toISOString(),
      minParticipants: slot.minParticipants,
      maxParticipants: slot.maxParticipants,
      status: slot.status as SlotCard['status'],
      participantsCount: slot.participants.length,
      joined: slot.participants.some((p) => p.userId === userId),
      isCreator: slot.creatorId === userId,
    }
  }
}
