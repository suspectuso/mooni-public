import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { LedgerService } from '../ledger/ledger.service'
import { trustedTelegramId } from '../auth/trusted-user'
import { cityLevel } from '../profile/city-level'

interface Stats {
  swipes: number
  routes: number
  coffee: number
  xp: number
}

interface Mission {
  key: string
  title: string
  emoji: string
  coins: number
  xp: number
  done: (s: Stats) => boolean
}

const MISSIONS: Mission[] = [
  {
    key: 'swipe_5',
    title: 'Свайпни 5 мест',
    emoji: '🔥',
    coins: 5,
    xp: 5,
    done: (s) => s.swipes >= 5,
  },
  {
    key: 'first_route',
    title: 'Собери первый маршрут',
    emoji: '🗺️',
    coins: 10,
    xp: 10,
    done: (s) => s.routes >= 1,
  },
  {
    key: 'coffee',
    title: 'Найди собеседника',
    emoji: '🤝',
    coins: 10,
    xp: 8,
    done: (s) => s.coffee >= 1,
  },
  {
    key: 'level_2',
    title: 'Дорасти до 2 городского уровня',
    emoji: '🔓',
    coins: 15,
    xp: 0,
    done: (s) => cityLevel(s.xp) >= 2,
  },
]

/** City Missions: выполнил действие → забрал награду (susCoin/xp), один раз. */
@Injectable()
export class MissionsService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  private async resolve(userId?: string, initData?: string) {
    const telegramId = trustedTelegramId(userId, initData)
    const existing = await this.prisma.user.findUnique({
      where: { telegramId },
    })
    return existing ?? this.prisma.user.create({ data: { telegramId } })
  }

  private async stats(userId: string, xp: number): Promise<Stats> {
    const [swipes, routes, coffee] = await Promise.all([
      this.prisma.swipe.count({ where: { userId } }),
      this.prisma.route.count({ where: { userId } }),
      this.prisma.coffeeRequest.count({ where: { userId } }),
    ])
    return { swipes, routes, coffee, xp }
  }

  async list(userId?: string, initData?: string) {
    const user = await this.resolve(userId, initData)
    const s = await this.stats(user.id, user.xp)
    const claimed = await this.prisma.userMission.findMany({
      where: { userId: user.id },
      select: { missionKey: true },
    })
    const claimedSet = new Set(claimed.map((c) => c.missionKey))
    return MISSIONS.map((m) => ({
      key: m.key,
      title: m.title,
      emoji: m.emoji,
      coins: m.coins,
      xp: m.xp,
      done: m.done(s),
      claimed: claimedSet.has(m.key),
    }))
  }

  async claim(userId: string, key: string, initData?: string) {
    const mission = MISSIONS.find((m) => m.key === key)
    if (!mission) throw new NotFoundException('Миссия не найдена')
    const user = await this.resolve(userId, initData)
    const s = await this.stats(user.id, user.xp)
    if (!mission.done(s))
      throw new BadRequestException('Миссия ещё не выполнена')

    try {
      await this.prisma.userMission.create({
        data: { userId: user.id, missionKey: key },
      })
    } catch {
      throw new ConflictException('Награда уже получена')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        susCoin: { increment: mission.coins },
        xp: { increment: mission.xp },
      },
    })
    await this.ledger.record(
      user.id,
      [
        { kind: 'susCoin', delta: mission.coins },
        { kind: 'xp', delta: mission.xp },
      ],
      `mission:${key}`,
    )
    return { ok: true, awarded: { coins: mission.coins, xp: mission.xp } }
  }
}
