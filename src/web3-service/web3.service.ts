/* eslint-disable prettier/prettier */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { environment } from './environment';

import { DatabaseService } from '../database/database/database.service';
import { ContractEntity } from '../database/entities/contract-entity/contract.entity';
import { TradeStatus } from '../database/database/interface';
import { TrackerService } from '../tracker-service/tracker.service';
import { WalletService } from './wallet.service';

@Injectable()
export class Web3Service implements OnModuleInit {
  private readonly logger = new Logger(Web3Service.name);
  private onInitCurrentBlockHeight: number;
  constructor(
    private db: DatabaseService,
    private tracker: TrackerService,
    private walletService: WalletService,
  ) {
    this.createNewTradeEntry = this.createNewTradeEntry.bind(this);
    this.unifiedDatabaseAction = this.unifiedDatabaseAction.bind(this);

    this.handleForSale = this.handleForSale.bind(this);
    this.handleSellerCancelled = this.handleSellerCancelled.bind(this);
    this.handleBuyerCommitted = this.handleBuyerCommitted.bind(this);
    this.handleBuyerCancelled = this.handleBuyerCancelled.bind(this);
    this.handleSellerCommitted = this.handleSellerCommitted.bind(this);
    this.handleSellerCancelledAfterBuyerCommitted =
      this.handleSellerCancelledAfterBuyerCommitted.bind(this);
    this.handleCompleted = this.handleCompleted.bind(this);
    this.handleDisputed = this.handleDisputed.bind(this);
    this.handleResolved = this.handleResolved.bind(this);
    this.handleClawbacked = this.handleClawbacked.bind(this);
  }

  /** Genereic functions  **/

  async onModuleInit() {
    this.onInitCurrentBlockHeight = await this.getCurrentBlockHeight();
    const lastKnownDbBlockHeight = await this.getLastKnownBlockHeight();
    if (this.onInitCurrentBlockHeight >= lastKnownDbBlockHeight) {
      this.getPastAlchemyLogs(lastKnownDbBlockHeight);
      this.logger.warn(
        `SystemStatus.WarmingUp | Behind on blocks | current ${this.onInitCurrentBlockHeight} vs last known: ${lastKnownDbBlockHeight}`,
      );
    } else {
      this.logger.error(
        `SystemStatus.Crashed | Incorrect blockHeights | current: ${this.onInitCurrentBlockHeight} vs last known: ${lastKnownDbBlockHeight}`,
      );
      process.exit(1); //Exit NestJS
    }
  }

  async getPastAlchemyLogs(_fromBlockHeight: number) { 
    const options = {
      address: environment.contractFactory.address,
      topics: [ContractFactoryTopics.statusChange],
      fromBlock: '0x0',
      toBlock: 'latest',
    };

    await this.walletService.wallet.alchemy.core.getLogs(options).then(async (logs) => {
      for await (const log of logs) {
        switch(log.topics[0]) {
          case ContractFactoryTopics.statusChange:
            await this._processStatusChangeTopic(log, log.blockNumber);
            break;
          default:
            this.logger.warn(`NOT A DEFAULT LOG (${log.topics[0]}):`, log);
            break;
        }
      }

      this.logger.log(
        `SystemStatus.Ready | Blocks up to date | to block: #${_fromBlockHeight}`,
      );

      this.listenToLogs(_fromBlockHeight);     

    }).catch((error) => {
      console.log('error', error);
    });
  }

  async listenToLogs(_blockHeight: number) {
    const hexBlockHeight = '0x' + _blockHeight.toString(16);
    const filter = {
      address: environment.contractFactory.address,
      topics: [ContractFactoryTopics.statusChange],
      fromBlock: hexBlockHeight,
    };

    this.walletService.wallet.alchemy.ws.on(filter, async (log, event)=>{
      const txHash = log.transactionHash;      
      const reciept = await this.walletService.wallet.alchemy.transact.waitForTransaction(txHash);

      switch(log.topics[0]) {
        case ContractFactoryTopics.statusChange:
          await this._processStatusChangeTopic(log, log.blockNumber);
          break;
        default:
          this.logger.warn(`NOT A DEFAULT LOG (${log.topics[0]}):`, log);
          break;
      }
    });
  }

  private async _processStatusChangeTopic(log: any, _blockHeight: number) {
    try {
      const contract = this.walletService.wallet.connectContract(
        environment.contractFactory.address,
        environment.contractFactory.abi,
      );
      const decodedLog = (await contract).interface.parseLog(log);
      
      await this._onStatusChange(decodedLog, _blockHeight);
    } catch (error) {
      this.logger.error(`Error in _processStatusChangeTopic: ${log} | ${error}` );
      throw error;
    }
  }

  /** Switch Status Change Event
   * Handles the status change event
   * @param event 
   * @param _blockHeight 
   */

  private async _onStatusChange(event: any, _blockHeight: number) {
    event.newStatus = event.args[1].toString();
    event.contractAddress = event.args[0].toString();
    event.data = event.args[2].toString();
    event.sellerAddress = event.args[3].toString();
    event.buyerAddress = event.args[4].toString();

    const statusHandlers: {
      [key in TradeStatus]?: (
        event: any,
        _blockHeight: number,
      ) => Promise<void>;
    } = {
      [TradeStatus.ForSale]: this.logHandler(
        this.handleForSale,
        'TradeStatus.ForSale',
      ),
      [TradeStatus.SellerCancelled]: this.logHandler(
        this.handleSellerCancelled,
        'TradeStatus.SellerCancelled',
      ),
      [TradeStatus.BuyerCommitted]: this.logHandler(
        this.handleBuyerCommitted,
        'TradeStatus.BuyerCommitted',
      ),
      [TradeStatus.BuyerCancelled]: this.logHandler(
        this.handleBuyerCancelled,
        'TradeStatus.BuyerCancelled',
      ),
      [TradeStatus.SellerCommitted]: this.logHandler(
        this.handleSellerCommitted,
        'TradeStatus.SellerCommitted',
      ),
      [TradeStatus.SellerCancelledAfterBuyerCommitted]: this.logHandler(
        this.handleSellerCancelledAfterBuyerCommitted,
        'TradeStatus.SellerCancelledAfterBuyerCommitted',
      ),
      [TradeStatus.Completed]: this.logHandler(
        this.handleCompleted,
        'TradeStatus.Completed',
      ),
      [TradeStatus.Disputed]: this.logHandler(
        this.handleDisputed,
        'TradeStatus.Disputed',
      ),
      [TradeStatus.Resolved]: this.logHandler(
        this.handleResolved,
        'TradeStatus.Resolved',
      ),
      [TradeStatus.Clawbacked]: this.logHandler(
        this.handleClawbacked,
        'TradeStatus.Clawbacked',
      ),
    };

    const handler = statusHandlers[event.newStatus];

    if (handler) {
      const statusIs = await this.db.isStatusHigherThanKnown(event);
      if (statusIs.higher) {
        await handler.call(this, event, _blockHeight);
      } else {
        this.logWarning(event, _blockHeight, event.newStatus, statusIs);
      }
    } else {
      console.error('status is unknown!', event.newStatus);
    }
  }

  private logHandler(
    fn: (event: any, _blockHeight: number) => Promise<any>,
    logMessage: string,
  ): (event: any, _blockHeight: number) => Promise<void> {
    return async (event: any, _blockHeight: number) => {
      const result = await fn(event, _blockHeight); 
      //console.log('result', result);      
      
      if (result && result.saved) {
        this.logger.log(
          `${logMessage} | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
        );
      } else if (result) {
        this.logger.warn(
          `${logMessage} | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
        );
      }
    };
  }

  private async unifiedDatabaseAction(
    event: any,
    _blockHeight: number,
    newStatus: TradeStatus,
    extraOptions: ExtraDataToUpdate = {},
  ): Promise<{ saved: boolean }> {
    return this.db.updateStatus(
      event.contractAddress,
      newStatus,
      _blockHeight,
      extraOptions,
    );
  }

  private logWarning(
    event: any,
    _blockHeight: number,
    status: TradeStatus,
    statusInfo: any,
  ) {
    this.logger.warn(
      `${status} | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${statusInfo.newStatus}/${statusInfo.currentStatus} | block: #${_blockHeight}`,
    );
  }

  private async createNewTradeEntry(event: any, _blockHeight: number) {    
    const [isValid, assetId, validationResults] =
      await this.tracker.validateIsItemInfoAndInspectSame(
        event.contractAddress,
        );
    const dataArray = event.data.split('||');

    const newStore: ContractEntity = {
      id: null,
      assetId: dataArray[1],
      contractAddress: event.contractAddress,
      itemMarketName: dataArray[0],
      status: event.newStatus,
      sellerTradeUrl: dataArray[2],
      buyerTradeUrl: '',
      isDisputed: false,
      disputeReason: '',
      lastBlockHeight: _blockHeight,
      statusHistory: [
        {
          id: null,
          contract: event.contractAddress,
          status: TradeStatus.ForSale,
          blockHeight: _blockHeight,
        },
      ],
      details: {
        floatValue: validationResults.floatValue.onChainValue,
        paintSeed: validationResults.paintSeed.onChainValue,
        paintIndex: validationResults.paintIndex.onChainValue,
      },
    };

    const result = await this.db.createOrReturn(newStore);

    if (!isValid) {
      const currentStatus: TradeStatus = await this.walletService.getTradeStatus(event.contractAddress);
      if(currentStatus != TradeStatus.Clawbacked && !result.saved){
        this.logger.warn(`[${event.contractAddress}] Item invalid: ${assetId}`);
        try {
          this.walletService.confirmTrade(event.contractAddress, false, 'INVALID_ITEM').then((res) => {
            this.logger.warn(`[${event.contractAddress}] Made TX to clawback: ${res.transactionHash}`);  
          }).catch((err) => {
            this.logger.error(`Catch 1: [${event.contractAddress}] Error in clawback send call (status ${currentStatus}): ${err}`);
          });
        } catch (error) {
          this.logger.error(`Catch 2: [${event.contractAddress}] Error in clawback send call (status ${currentStatus}): ${error}`);
        } 
      }          
    }

    return result;
  }

  /** Handlers 
   * @param event 
   * @param _blockHeight 
   * @returns database result
   */

  private async handleForSale(event: any, _blockHeight: number) {
    return await this.createNewTradeEntry(event, _blockHeight);
  }

  private async handleSellerCancelled(event: any, _blockHeight: number) {
    return await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);
  }

  private async handleBuyerCommitted(event: any, _blockHeight: number) {
    const result = await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);

    return result;
  }

  private async handleBuyerCancelled(event: any, _blockHeight: number) {
    return await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);
  }

  private async handleSellerCommitted(event: any, _blockHeight: number) {
    const dataArray = event.data.split('||');
    const _buyerTradeUrl = dataArray[1];
    const result = await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus, {
      buyerTradeUrl: _buyerTradeUrl,
    });
    await this.tracker.onSellerCommitted(event, _blockHeight);
    return result;
  }

  private async handleSellerCancelledAfterBuyerCommitted(
    event: any,
    _blockHeight: number,
  ) {
    return await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);
  }

  private async handleCompleted(event: any, _blockHeight: number) {
    const result = await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);
    await this.tracker.removeTrackedItem(event.contractAddress);
    return result;
  }

  private async handleDisputed(event: any, _blockHeight: number) {
    await this.tracker.removeTrackedItem(event.contractAddress);
    return await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);
  }

  private async handleResolved(event: any, _blockHeight: number) {
    await this.tracker.removeTrackedItem(event.contractAddress);
    return await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);
  }

  private async handleClawbacked(event: any, _blockHeight: number) {
    await this.tracker.removeTrackedItem(event.contractAddress);
    return await this.unifiedDatabaseAction(event, _blockHeight, event.newStatus);
  }

  /** Utils **/

  private async getLastKnownBlockHeight(): Promise<number> {
    const lastKnownBlockHeight = await this.db.fetchLastKnownBlock();
    return lastKnownBlockHeight;
  }

  private async getCurrentBlockHeight(): Promise<number> {
    return await this.walletService.wallet.alchemy.core.getBlockNumber();
  }
}

enum ContractFactoryTopics {
  statusChange = '0x2c6c2c8fac99064b89e2a97cba30b9bce7b1a84a55e0310e16b56924c6ab2f45',
}

interface ExtraDataToUpdate {
  buyerTradeUrl?: string;
  isDisputed?: boolean;
  disputeReason?: string;
}
