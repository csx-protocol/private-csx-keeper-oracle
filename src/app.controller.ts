import { Controller } from '@nestjs/common';
import { TrackerService } from './tracker-service/tracker.service';

@Controller()
export class AppController {
  constructor(private readonly tracker: TrackerService) {}
}
