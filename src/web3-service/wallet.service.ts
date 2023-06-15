/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FloatApiService } from '../float-api/float-api.service';
import { Wallet } from './wallet';
import { environment } from './environment';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  wallet: Wallet;
  constructor() {
    this.wallet = new Wallet(environment.wallet.key, environment.wallet.rpcUrl);
    this.logger.log('WalletService dependencies injected');
  }
}