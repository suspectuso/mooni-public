import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/** Каталог локальных услуг (гиды по крышам, фотографы, аренда залов). Публично. */
@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  list(type?: string) {
    return this.prisma.localService.findMany({
      where: { active: true, ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }
}
