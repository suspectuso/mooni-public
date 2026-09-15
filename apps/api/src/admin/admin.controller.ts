import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AdminGuard } from './admin.guard'
import { AdminService, type PlaceInput } from './admin.service'

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats()
  }

  @Post('embed-places')
  embedPlaces() {
    return this.admin.embedPlaces()
  }

  @Post('afisha/sync')
  syncAfisha() {
    return this.admin.syncAfisha()
  }

  @Get('categories')
  categories() {
    return this.admin.categories()
  }

  @Get('ledger')
  ledger(@Query('userId') userId?: string) {
    return this.admin.ledger(userId)
  }

  @Get('places')
  places() {
    return this.admin.listPlaces()
  }

  @Post('places')
  createPlace(@Body() body: PlaceInput) {
    return this.admin.createPlace(body)
  }

  @Patch('places/:id')
  updatePlace(@Param('id') id: string, @Body() body: Partial<PlaceInput>) {
    return this.admin.updatePlace(id, body)
  }

  @Delete('places/:id')
  deletePlace(@Param('id') id: string) {
    return this.admin.deletePlace(id)
  }

  @Get('ingestion/pending')
  pending() {
    return this.admin.pending()
  }

  @Post('ingestion/:id/approve')
  approve(@Param('id') id: string, @Body() body: PlaceInput) {
    return this.admin.approve(id, body)
  }

  @Post('ingestion/:id/approve-suggested')
  approveSuggested(@Param('id') id: string) {
    return this.admin.approveSuggested(id)
  }

  @Post('ingestion/:id/reject')
  reject(@Param('id') id: string) {
    return this.admin.reject(id)
  }
}
