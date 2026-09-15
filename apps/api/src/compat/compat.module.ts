import { Module } from '@nestjs/common'
import { AiModule } from '../ai/ai.module'
import { ProfileModule } from '../profile/profile.module'
import { CompatService } from './compat.service'
import { CompatNetworkingController } from './compat-networking.controller'
import { CompatUsersController } from './compat-users.controller'
import { CompatSprintsController } from './compat-sprints.controller'
import { CompatContentController } from './compat-content.controller'

@Module({
  imports: [AiModule, ProfileModule],
  controllers: [
    CompatNetworkingController,
    CompatUsersController,
    CompatSprintsController,
    CompatContentController,
  ],
  providers: [CompatService],
})
export class CompatModule {}
