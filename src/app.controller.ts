import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { TrackerService } from './tracker-service/tracker.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tracker: TrackerService,
  ) {}

  // params steamID
  @Get('inventory/:steamId64')
  async getInventory(@Param('steamId64') steamId64: string): Promise<any> {
    return this.tracker.getInventory(steamId64);
  }
}
