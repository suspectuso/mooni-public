import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { AiModule } from './ai/ai.module'
import { BotModule } from './bot/bot.module'
import { LedgerModule } from './ledger/ledger.module'
import { AsrModule } from './asr/asr.module'
import { ProfileModule } from './profile/profile.module'
import { ServicesModule } from './services/services.module'
import { RelationshipModule } from './relationship/relationship.module'
import { MissionsModule } from './missions/missions.module'
import { GamificationModule } from './gamification/gamification.module'
import { FeedModule } from './feed/feed.module'
import { SwipeModule } from './swipe/swipe.module'
import { RoutesModule } from './routes/routes.module'
import { EventsModule } from './events/events.module'
import { UsersModule } from './users/users.module'
import { IngestionModule } from './ingestion/ingestion.module'
import { SlotsModule } from './slots/slots.module'
import { CompatModule } from './compat/compat.module'
import { RewardsModule } from './rewards/rewards.module'
import { ExperiencesModule } from './experiences/experiences.module'
import { PaymentsModule } from './payments/payments.module'
import { NpcModule } from './npc/npc.module'
import { AdminModule } from './admin/admin.module'
import { CoffeeModule } from './coffee/coffee.module'
import { MemoriesModule } from './memories/memories.module'
import { CityModule } from './city/city.module'
import { SeasonModule } from './season/season.module'
import { MonitoringModule } from './monitoring/monitoring.module'

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 120 }, // 120 запросов/мин на IP
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AiModule,
    AsrModule,
    BotModule,
    LedgerModule,
    ProfileModule,
    ServicesModule,
    RelationshipModule,
    MissionsModule,
    GamificationModule,
    FeedModule,
    SwipeModule,
    RoutesModule,
    EventsModule,
    UsersModule,
    IngestionModule,
    SlotsModule,
    CompatModule,
    RewardsModule,
    ExperiencesModule,
    PaymentsModule,
    NpcModule,
    AdminModule,
    CoffeeModule,
    MemoriesModule,
    CityModule,
    SeasonModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
