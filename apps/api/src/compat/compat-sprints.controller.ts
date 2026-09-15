import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CompatService } from './compat.service'

/**
 * Совместимость с фронтом Match: слоты Mooni через экран «спринтов» Match
 * (компоненты Match, данные наши — список/деталь/join/leave/лидерборд).
 */
@Controller()
export class CompatSprintsController {
  constructor(
    private prisma: PrismaService,
    private compat: CompatService,
  ) {}

  @Get('sprints')
  async sprintsList() {
    const slots = await this.prisma.activitySlot.findMany({
      where: {
        status: { in: ['open', 'confirmed'] },
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: 'asc' },
      include: { participants: { where: { status: 'joined' } } },
      take: 50,
    })
    return slots.map((s) => this.compat.slotToSprint(s))
  }

  @Get('sprints/user/:userId')
  async sprintsOfUser(@Param('userId') userId: string) {
    // userId здесь — внутренний id (страница берёт его из users/telegram)
    const slots = await this.prisma.activitySlot.findMany({
      where: { participants: { some: { userId, status: 'joined' } } },
      include: { participants: { where: { status: 'joined' } } },
    })
    return slots.map((s) => this.compat.slotToSprint(s))
  }

  @Get('sprints/:id')
  async sprintDetail(@Param('id') id: string) {
    const slot = await this.prisma.activitySlot.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: 'joined' },
          include: {
            user: { select: { id: true, firstName: true, username: true } },
          },
        },
      },
    })
    if (!slot) return { error: 'not found' }
    return this.compat.slotToSprint(slot)
  }

  @Post('sprints/:id/join')
  async sprintJoin(@Param('id') id: string, @Body() body: { userId: string }) {
    // body.userId — внутренний id пользователя
    await this.prisma.activityParticipant.upsert({
      where: { slotId_userId: { slotId: id, userId: body.userId } },
      update: { status: 'joined' },
      create: { slotId: id, userId: body.userId },
    })
    const joined = await this.prisma.activityParticipant.count({
      where: { slotId: id, status: 'joined' },
    })
    const slot = await this.prisma.activitySlot.findUnique({ where: { id } })
    if (slot && joined >= slot.minParticipants && slot.status === 'open') {
      await this.prisma.activitySlot.update({
        where: { id },
        data: { status: 'confirmed' },
      })
    }
    return { ok: true }
  }

  @Delete('sprints/:id/leave')
  async sprintLeave(@Param('id') id: string, @Body() body: { userId: string }) {
    await this.prisma.activityParticipant.updateMany({
      where: { slotId: id, userId: body.userId },
      data: { status: 'left' },
    })
    const joined = await this.prisma.activityParticipant.count({
      where: { slotId: id, status: 'joined' },
    })
    const slot = await this.prisma.activitySlot.findUnique({ where: { id } })
    if (slot && joined < slot.minParticipants && slot.status === 'confirmed') {
      await this.prisma.activitySlot.update({
        where: { id },
        data: { status: 'open' },
      })
    }
    return { ok: true }
  }

  // Лидерборд слота — список участников (форма Match {data, pagination})
  @Get('sprints/:id/leaderboard')
  async sprintLeaderboard(@Param('id') id: string) {
    const parts = await this.prisma.activityParticipant.findMany({
      where: { slotId: id, status: 'joined' },
      include: {
        user: { select: { firstName: true, username: true, xp: true } },
      },
      orderBy: { joinedAt: 'asc' },
    })
    return {
      data: parts.map((p, i) => ({
        rank: i + 1,
        userId: p.userId,
        points: p.user.xp,
        user: {
          firstName: p.user.firstName,
          username: p.user.username,
          avatarUrl: null,
        },
      })),
      pagination: { totalPages: 1, page: 1 },
    }
  }
}
