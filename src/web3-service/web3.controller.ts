/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Logger,
} from '@nestjs/common';
import { Web3Service } from './web3.service'; // Import your Web3Service
import { environment } from './environment';

@Controller('status')
export class Web3Controller {
  private readonly logger = new Logger(Web3Controller.name);
  constructor(private readonly web3Service: Web3Service) {}

  @Post('start-listening')
  @HttpCode(HttpStatus.ACCEPTED)
  async startListeningToLogs(@Body() admin: AdminBody): Promise<string> {
    if (admin.secret !== environment.admin.secret) {
      return 'Invalid secret.';
    }
    this.logger.log('Starting to listen to logs by admin.');
    const lastKnownDbBlockHeight =
      await this.web3Service.getLastKnownBlockHeight();
    this.web3Service.listenToLogs(lastKnownDbBlockHeight);
    return `Started listening to logs from block ${lastKnownDbBlockHeight}.`;
  }

  @Get('stop-listening')
  @HttpCode(HttpStatus.OK)
  async stopListeningToLogs(@Body() admin: AdminBody): Promise<string> {
    if (admin.secret !== environment.admin.secret) {
      return 'Invalid secret.';
    }
    this.logger.log('Stopping to listen to logs by admin.');
    this.web3Service.stopListeningToLogs();
    return `Stopped listening to logs from block ${await this.web3Service.getLastKnownBlockHeight()}.`;
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck(): string {
    return 'OK';
  }
}

export interface AdminBody {
  secret: string;
}
