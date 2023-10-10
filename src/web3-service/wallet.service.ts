/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { WalletBase } from './wallet';
import { environment } from './environment';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  wallet: WalletBase;
  constructor() {
    this.wallet = new WalletBase(
      environment.wallet.walletKey, 
      environment.wallet.apiKey
      );
    this.logger.log('WalletService dependencies injected');
  }

  async connectTradeContract(address: string) {
    return await this.wallet.connectContract(
      address,
      environment.tradeContract.abi,
    );
  }

  async confirmTrade(contractAddress: any, isTradeMade: boolean, message: string) {
    const contract = await this.connectTradeContract(contractAddress);
    return await contract.keeperNodeConfirmsTrade(isTradeMade, message);
  }

  async getTradeStatus(contractAddress: any) {
    const contract = await this.connectTradeContract(contractAddress);
    return await contract.status();
  }

  async getfinalityResult(contractAddress: any) {
    const contract = await this.connectTradeContract(contractAddress);
    return await contract.finalityResult();
  }
}
