import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    this.custom();
  }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  custom() {
    console.log('Custom');
  }
}
