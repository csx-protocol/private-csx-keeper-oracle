import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { TrackerService } from './tracker/tracker.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tracker: TrackerService,
  ) {}

  @Get()
  demo(): string {
    return this.tracker.runDemo();
  }
}
