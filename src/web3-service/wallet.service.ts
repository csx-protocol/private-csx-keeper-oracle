/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
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

  connectTradeContract(address: string) {
    return this.wallet.connectContract(
      address,
      environment.tradeContract.abi
    );
  }

  async confirmTrade(contractAddress: any, veridict: boolean) {
    const contract = await this.connectTradeContract(contractAddress);
    return await contract.methods.keeperNodeConfirmsTrade(veridict).send({ from: this.wallet.myAccount });
  }
}
