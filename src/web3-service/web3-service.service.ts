/* eslint-disable prettier/prettier */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { environment } from './environment';
import { Wallet } from './wallet';

import { DatabaseService } from '../database/database/database.service';
import { ContractEntity } from '../database/entities/contract-entity/contract.entity';
import { TradeStatus } from '../database/database/interface';

@Injectable()
export class Web3Service implements OnModuleInit {
  private readonly logger = new Logger(Web3Service.name);
  private wallet: Wallet;
  //private tradeContracts: TradeContract[] =  [];
  private onInitCurrentBlockHeight: number;
  constructor(private db: DatabaseService) {
    this.wallet = new Wallet(environment.wallet.key, environment.wallet.rpcUrl);
  }

  /** Genereic functions  **/

  async onModuleInit() {
    this.onInitCurrentBlockHeight = await this.getCurrentBlockHeight();
    const lastKnownDbBlockHeight = await this.getLastKnownBlockHeight();
    if (this.onInitCurrentBlockHeight >= lastKnownDbBlockHeight) {
      await this.warmupContractFactoryTopics(
        lastKnownDbBlockHeight,
        this.onInitCurrentBlockHeight,
      );
      this.logger.warn(
        `SystemStatus.WarmingUp | Behind on blocks | current ${this.onInitCurrentBlockHeight} vs last known: ${lastKnownDbBlockHeight}`,
      );
    } else {
      this.logger.error(
        `SystemStatus.Crashed | Incorrect blockHeights | current: ${this.onInitCurrentBlockHeight} vs vs last known: ${lastKnownDbBlockHeight}`,
      );
      process.exit(1); //Exit NestJS
    }
  }

  private async warmupContractFactoryTopics(
    _blockHeight: number,
    _toBlockHeight: number,
  ) {
    const options = {
      address: environment.contractFactory.address,
      topics: [ContractFactoryTopics.statusChange],
      fromBlock: _blockHeight,
      toBlock: _toBlockHeight,
    };

    /** this.subscription = */ this.wallet.web3.eth
      .getPastLogs(options)
      .then(async (logs) => {
        // sort the logs based on their block height
        logs.sort((a, b) => {
          return a.blockNumber - b.blockNumber;
        });

        for (const log of logs) {
          for (const _topic of log.topics) {
            switch (_topic) {
              case ContractFactoryTopics.statusChange:
                //console.log(`Processing status change topic..`);
                await this._processStatusChangeTopic(log, log.blockNumber);
                break;
              default:
                this.logger.warn(`NOT A DEFAULT LOG (${_topic}):`, log);
                break;
            }
          }
        }
        const currentBlockHeight = await this.getCurrentBlockHeight();

        if (currentBlockHeight > _toBlockHeight) {
          this.logger.warn(
            `SystemStatus.NotReady | More Blocks Incoming | updated to: ${_toBlockHeight} vs current: ${currentBlockHeight}`,
          );

          await this.warmupContractFactoryTopics(
            _blockHeight + 1,
            currentBlockHeight,
          );
        } else {
          this.logger.warn(
            `SystemStatus.Ready | Blocks up to date | to block: #${_toBlockHeight}`,
          );
          this.listenToContractFactoryTopics(currentBlockHeight);
        }
      })
      .catch((error) => {
        console.log('error!', error);
      });
  }

  private async listenToContractFactoryTopics(_blockHeight: number) {
    this.logger.warn(
      `SystemStatus.Live | Listening to new events | from block: #${_blockHeight}`,
    );
    const options = {
      address: environment.contractFactory.address,
      topics: [ContractFactoryTopics.statusChange],
      fromBlock: _blockHeight,
    };
    /** this.subscription = */ this.wallet.web3.eth
      .subscribe('logs', options, async (error, log) => {
        if (error) {
          console.log('error!', error);
          return;
        }

        //console.log('daloggRrr', log);

        for await (const _topic of log.topics) {
          switch (_topic) {
            case ContractFactoryTopics.statusChange:
              await this._processStatusChangeTopic(log, _blockHeight);
              break;
            default:
              this.logger.warn(`NOT A DEFAULT LOG (${_topic}):`, log);
              break;
          }
        }
      })
      .on('data', (/*log*/) => {
        //console.log(log);
      });
  }

  private async _processStatusChangeTopic(log: any, _blockHeight: number) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const statusChangeResult = this._decodeLog(
          StatusChangeEventValues,
          log,
        );
        //console.log('statusChangeResult', statusChangeResult);
        await this._onStatusChange(statusChangeResult, _blockHeight);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private _decodeLog(any: any[], log: any): any {
    return this.wallet.web3.eth.abi.decodeLog(any, log.data, log.topics);
  }

  /** Switch Status Change **/

  private async _onStatusChange(event: any, _blockHeight: number) {
    //... do something with the event
    switch (event.newStatus) {
      case TradeStatus.ForSale:
        const newForSaleStatusIs = await this.db.isStatusHigherThanKnown(event);
        if (newForSaleStatusIs.higher) {
          await this.__onContractCreation(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.ForSale | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newForSaleStatusIs.newStatus}/${newForSaleStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }
        break;

      case TradeStatus.SellerCancelled:
        /**
       * If status is higher than status in db: 
       change status to 1 in db
        */
        const newSellerCancelledStatusIs =
          await this.db.isStatusHigherThanKnown(event);

        if (newSellerCancelledStatusIs.higher) {
          await this.__onSellerCancelledDatabaseAction(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.SellerCancelled | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newSellerCancelledStatusIs.newStatus}/${newSellerCancelledStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }
        break;

      case TradeStatus.BuyerCommitted:
        /**
         * If status is higher than status in db:
         add buyerAddress
         change status to 2 in db
            then:
            call item-tracker provide buyer/seller inv .> then calls:
            onAction: const _contract = await this.wallet.connectContract(
              <contractAddress>,
              environment.tradeContract.abi,
            ); <- maybe do from itemtracker the wallet tingy?
            and logs it or do it on accepted?.
         */
        const newBuyerCommittedStatusIs = await this.db.isStatusHigherThanKnown(
          event,
        );
        if (newBuyerCommittedStatusIs.higher) {
          await this.__onBuyerCommittedDatabaseAction(event, _blockHeight);
          //Call Item Tracker (prep args in a sep function if needed) here!
        } else {
          this.logger.warn(
            `TradeStatus.Committed | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newBuyerCommittedStatusIs.newStatus}/${newBuyerCommittedStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }
        break;

      case TradeStatus.BuyerCancelled:
        /**
         * If status is higher than status in db:
         * change status to 3 in db
         * then:
         * !close item specific tracker instance!? (if it exists)
         * */
        const newBuyerCancelledStatusIs = await this.db.isStatusHigherThanKnown(
          event,
        );
        if (newBuyerCancelledStatusIs.higher) {
          await this.__onBuyerCancelledDatabaseAction(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.BuyerCancelled | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newBuyerCancelledStatusIs.newStatus}/${newBuyerCancelledStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }
        break;

      case TradeStatus.SellerCommitted:
        /**
         * If status is higher than status in db:
         change status to 4 in db
            then:
          check if item-tracker not already has a session for the trade?
            if not, item-tracker run with emphasizes seller already sent item 
              (is item still in seller inv? (punish behaviour(cant cuz cant verify count) and undo accept?))
              (so no punish or revert trade if item not found in seller inv)
              (only check if x item has arrived to buyer 
                (check prev count vs now..etc 
                  (has no prev data? 
                    (do nothing 
                      (3 day release claim for seller)))))
            if it is, item-tracker run with emphasizes seller already sent item 
                (is item still in seller inv? (punish behaviour and undo accept!))
                or
                (item is not in seller inv, (item is buyer now in buyer inv?))
         */
        const newSellerCommittedStatusIs =
          await this.db.isStatusHigherThanKnown(event);

        if (newSellerCommittedStatusIs.higher) {
          await this.__onSellerCommittedDatabaseAction(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.SellerCommitted | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newSellerCommittedStatusIs.newStatus}/${newSellerCommittedStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }

        break;

      case TradeStatus.SellerCancelledAfterBuyerCommitted:
        /**
         * If status is higher than status in db:
         * change status to 5 in db
         * then:
         * !close item specific tracker instance!? (if it exists)
         * */
        const newSellerCancelledAfterBuyerCommittedStatusIs =
          await this.db.isStatusHigherThanKnown(event);

        if (newSellerCancelledAfterBuyerCommittedStatusIs.higher) {
          await this.__onSellerCancelledAfterBuyerCommittedDatabaseAction(
            event,
            _blockHeight,
          );
        } else {
          this.logger.warn(
            `TradeStatus.SellerCancelledAfterBuyerCommitted | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newSellerCancelledAfterBuyerCommittedStatusIs.newStatus}/${newSellerCancelledAfterBuyerCommittedStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }

        break;

      case TradeStatus.Completed:
        /**
         * If status is higher than status in db:
         change status to 6 in db
              then:
                !close item specific tracker instance!
         */
        const newCompletedStatusIs = await this.db.isStatusHigherThanKnown(
          event,
        );
        if (newCompletedStatusIs.higher) {
          await this.__onCompletedDatabaseAction(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.Completed | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newCompletedStatusIs.newStatus}/${newCompletedStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }

        break;

      case TradeStatus.Disputed:
        /**
         * If status is higher than status in db:
         * change status to 7 in db
         * then:
         * !close item specific tracker instance!? (if it exists)
         * */
        const newDisputedStatusIs = await this.db.isStatusHigherThanKnown(
          event,
        );
        if (newDisputedStatusIs.higher) {
          await this.__onDisputedDatabaseAction(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.Disputed | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newDisputedStatusIs.newStatus}/${newDisputedStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }

        break;

      case TradeStatus.Resolved:
        /**
         * If status is higher than status in db:
         * change status to 8 in db
         * then:
         * !close item specific tracker instance!? (if it exists)
         * */
        const newResolvedStatusIs = await this.db.isStatusHigherThanKnown(
          event,
        );

        if (newResolvedStatusIs.higher) {
          await this.__onResolvedDatabaseAction(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.Resolved | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newResolvedStatusIs.newStatus}/${newResolvedStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }

        break;

      case TradeStatus.Clawbacked:
        /**
         * If status is higher than status in db:
         * change status to 9 in db
         * then:
         * !close item specific tracker instance!? (if it exists)
         * */
        const newClawbackedStatusIs = await this.db.isStatusHigherThanKnown(
          event,
        );

        if (newClawbackedStatusIs.higher) {
          await this.__onClawbackedDatabaseAction(event, _blockHeight);
        } else {
          this.logger.warn(
            `TradeStatus.Clawbacked | Status Lower than or Equal to Known | ${event.contractAddress} | Status (new/old): ${newClawbackedStatusIs.newStatus}/${newClawbackedStatusIs.currentStatus} | block: #${_blockHeight}`,
          );
        }

        break;

      default:
        console.error('status is unknown!', event.newStatus);
        break;
    }
  }

  /** onValid status changes
   * 0 - ForSale :: __onContractCreation()
   * 1 - SellerCancelled :: __onSellerCancelledDatabaseAction()
   * 2 - BuyerCommitted :: __onBuyerCommittedDatabaseAction()
   * 3 - BuyerCancelled :: __onBuyerCancelledDatabaseAction()
   * 4 - SellerCommitted :: __onSellerCommittedDatabaseAction()
   * 5 - SellerCancelledAfterBuyerCommitted :: __onSellerCancelledAfterBuyerCommittedDatabaseAction()
   * 6 - Completed :: __onCompletedDatabaseAction()
   * 7 - Disputed :: __onDisputedDatabaseAction()
   * 8 - Resolved :: __onResolvedDatabaseAction()
   * 9 - Clawbacked :: __onClawbackedDatabaseAction()
   */

  private async __onContractCreation(event: any, _blockHeight: number) {
    const dataArray = event.data.split('||');

    const newStore: ContractEntity = {
      id: null,
      assetId: dataArray[2],
      contractAddress: event.contractAddress,
      itemMarketName: dataArray[0],
      status: event.newStatus,
      sellerTradeUrl: dataArray[1],
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
    };

    const result = await this.db.createOrReturn(newStore);

    if (result.saved) {
      this.logger.log(
        `TradeStatus.Pending | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.Pending | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onSellerCancelledDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    //... const dataArray = event.data.split('||');
    console.log('__onSellerCancelled', event);

    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.SellerCancelled | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.SellerCancelled | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onBuyerCommittedDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const dataArray = event.data.split('||');
    // console.log('dataArray', dataArray);
    const _buyerTradeUrl = dataArray[1];

    const extraOptions: ExtraDataToUpdate = {
      buyerTradeUrl: _buyerTradeUrl,
    };

    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
      extraOptions,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.Committed | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
      // Simulate Item has been sent after 1 min (for testing) by calling contract to release funds to seller .
      // console.log('releaseFundsToSeller in 1 minute from:', await this.wallet.web3signer.eth.getAccounts());
      // setTimeout(async () => {
      //   const _contract = await this.wallet.connectContract(
      //     event.contractAddress,
      //     environment.tradeContract.abi,
      //   );
      //   const acc = await this.wallet.web3signer.eth.getAccounts();
      //   const _result = await _contract.methods.keeperNodeConfirmsTrade(true).send({
      //     from: acc[0],
      //   });
      //   console.log('releaseFundsToSeller complete', _result);
      // }, 60000);
    } else {
      this.logger.warn(
        `TradeStatus.Committed | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onBuyerCancelledDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.BuyerCancelled | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.BuyerCancelled | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onSellerCommittedDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.SellerConfirmed | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.SellerConfirmed | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onSellerCancelledAfterBuyerCommittedDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.SellerCancelledAfterBuyerCommitted | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.SellerCancelledAfterBuyerCommitted | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onCompletedDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.Completed | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.Completed | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onDisputedDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.Dispute | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.Dispute | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onResolvedDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.Resolved | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.Resolved | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }

  private async __onClawbackedDatabaseAction(
    event: any,
    _blockHeight: number,
  ) {
    const result = await this.db.updateStatus(
      event.contractAddress,
      event.newStatus,
      _blockHeight,
    );

    if (result.saved) {
      this.logger.log(
        `TradeStatus.Clawbacked | Saved | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    } else {
      this.logger.warn(
        `TradeStatus.Clawbacked | Known | ${event.contractAddress} | BlockHeight: ${_blockHeight}`,
      );
    }
  }
  
  /** Utils **/

  private listenToEverythingOnChain() {
    this.wallet.web3.eth.subscribe('logs', {}, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        console.log(result);
      }
    });
  }

  private async getLastKnownBlockHeight(): Promise<number> {
    const lastKnownBlockHeight = await this.db.fetchLastKnownBlock();
    return lastKnownBlockHeight;
  }

  private async getCurrentBlockHeight(): Promise<number> {
    return await this.wallet.web3.eth.getBlockNumber();
  }
}

const StatusChangeEventValues = [
  {
    type: 'address',
    name: 'contractAddress',
    indexed: false,
  },
  {
    type: 'uint8',
    name: 'newStatus',
    indexed: false,
  },
  {
    type: 'string',
    name: 'data',
    indexed: false,
  },
];

enum ContractFactoryTopics {
  statusChange = '0xe84cfdc339669fa65116ce7f2ca5c4d0818d0ba66cc7fa49d99a653a89882b1d',
}

interface ExtraDataToUpdate {
  buyerTradeUrl?: string;
  isDisputed?: boolean;
  disputeReason?: string;
}
