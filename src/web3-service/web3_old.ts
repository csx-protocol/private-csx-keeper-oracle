// /* eslint-disable prettier/prettier */
// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { Subscription } from 'rxjs';
// import { environment } from './environment';
// import { Wallet } from './wallet';

// import * as fs from 'fs';
// import { DatabaseService } from '../database/database/database.service';
// interface TradeContract {
//   address: string;
//   contract: any;
//   subscription: Subscription;
// }

// @Injectable()
// export class Web3Service implements OnModuleInit {
//   private readonly logger = new Logger(Web3Service.name);
//   private wallet: Wallet;
//   private tradeContracts: TradeContract[] = [];
//   private onInitBlockHeight: number;
//   constructor(private db: DatabaseService) {
//     this.wallet = new Wallet(environment.wallet.key, environment.wallet.rpcUrl);
//   }

//   async onModuleInit() {
//     this.onInitBlockHeight = await this.getBlockHeight();
//     const blockHeight = await this.onWarmupContracts();
//     await this.listenToContractFactoryTopics(blockHeight);
//   }

//   private async listenToContractFactoryTopics(_blockHeight: number) {
//     const options = {
//       address: environment.contractFactory.address,
//       topics: [ContractFactoryTopics.TradeContractCreated],
//       fromBlock: _blockHeight,
//     };
//     // if (_blockHeight != '0') {
//     //   this.logger.warn( 
//     //     `FACTORY_LISTENER acknowledged last known blockheight (${_blockHeight}), starting from there.`,
//     //   );

//     //   options.fromBlock = _blockHeight;
//     // }
//     /** this.subscription = */ this.wallet.web3.eth
//       .subscribe('logs', options, async (error, log) => {
//         if (error) {
//           console.log('error!', error);
//           return;
//         }

//         //console.log('daloggRrr', log); 

//         for (const _topic of log.topics) {
//           switch (_topic) {
//             case ContractFactoryTopics.TradeContractCreated:
//               const result = this.decodeLog(
//                 TradeContractCreatedEventValues,
//                 log,
//               );
//               //console.log(result); 

//               await this._onContractCreation(result, log.blockNumber);

//               break;
//             default:
//               console.log('NOT A DEFAULT LOG (full log):', log);
//               console.log('NOT A DEFAULT LOG! (topic)', _topic);
//               break;
//           }
//         }

//         /**
//            * Result {
//             '0': '0x5596A8998Fb0A9B15861608AC869509537d42166',
//             '1': 'https://steamcommunity.com/tradeoffer/new/?partner=1337&token=XXXX',
//             __length__: 2,
//             contractAddress: '0x5596A8998Fb0A9B15861608AC869509537d42166',
//             tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=1337&token=XXXX'
//           }
//           */
//       })
//       .on('data', (/*log*/) => {
//         //console.log(log); 
//       });
//   }

//   private async _onContractCreation(event: any, _blockHeight: number) {
//     //console.log("EVENT!!!!",event);
    
//     this.logger.log(`CONTRACT_FOUND ${event.contractAddress}`);
//     const storeObject = {
//       contractAddress: event.contractAddress,
//       tradeUrl: event.tradeUrl,
//       lastBlockHeight: _blockHeight
//     }
//     //await this.addObjectToJSONFile('./data/contracts.json', storeObject);
//     await this.db.createOrReturn({id: 0, ...storeObject})

//     const _contract = await this.wallet.connectContract(
//       event.contractAddress,
//       environment.tradeContract.abi,
//     );
//     this.tradeContracts.push({
//       address: event.contractAddress,
//       contract: _contract,
//       subscription: await this.listenToContractTradeTopics(
//         event.contractAddress, storeObject.lastBlockHeight
//       ),
//     });
//     this.logger.log(
//       `CONTRACT_CREATED ${event.contractAddress}, saved and listening.`,
//     );
//   }

//   private async onWarmupContracts(): Promise<number> {
//     const contracts = await this.db.findAll();//await this.readJSONFile('./data/contracts.json');   
//     if (contracts) {
//       this.logger.warn(`WARMUP Loading known contracts to keep an eye on..`);
//       for (const _contract of contracts) {
//         const _connectedContract = await this.wallet.connectContract(
//           _contract.contractAddress,
//           environment.tradeContract.abi,
//         );
//         this.tradeContracts.push({
//           address: _contract.contractAddress,
//           contract: _connectedContract,
//           subscription: await this.listenToContractTradeTopics(
//             _contract.contractAddress, _contract.lastBlockHeight
//           ),
//         });
//       }
//       this.logger.warn(
//         `WARMUP ${contracts.length} Previous known contracts loaded to height ${
//           contracts[contracts.length - 1].lastBlockHeight
//         }.`,
//       );
//       return contracts[contracts.length - 1].lastBlockHeight;
//     }
//     return 0;
//   }

//   private async listenToContractTradeTopics(
//     _address: string,
//     _blockHeight: number,
//   ): Promise<any> {
//     const options = {
//       address: _address,
//       // topics: [
//       //       ContractTradeTopics.BuyerCommitted,
//       //       ContractTradeTopics.StatusChange
//       // ],
//       fromBlock: _blockHeight,
//     };
//     return this.wallet.web3.eth
//       .subscribe('logs', options, (error, log) => {
//         if (error) {
//           console.log('error!', error);
//           return;
//         }

//         console.log('daTradeLogger', log);

//         for (const _topic of log.topics) {
//           switch (_topic) {
//             /**
//              * Make sure on all topics where keeper-oracle interacts with contract
//              * that the state is actually correct by calling on-chain state then on-chain execution.
//              * otherwise on warmup the block topic next after is the state 
//              */
//             case ContractTradeTopics.BuyerCommitted:
//               const buyerCommittedResults = this.decodeLog(
//                 BuyerCommittedEventValues,
//                 log,
//               );
//               console.log(buyerCommittedResults);

//               //this.onBuyerCommitted(buyerCommittedResults);

//               break;
//             case ContractTradeTopics.StatusChange: // All status changes except BuyerCommitted & keeperNode functions
//               const statusChangeResult = this.decodeLog(
//                 StatusChangeEventValues,
//                 log,
//               );
//               console.log(statusChangeResult);

//               /*
//                    enum TradeStatus {
//                       Pending,
//                       SellerCancelled,
//                       Committed,
//                       Accepted,
//                       Completed,
//                       Disputed,
//                       Resolved,
//                       Clawbacked
//                    }
//                 */

//               //this.onSellerCancelled(sellerCancelledResult);

//               break;
//             default:
//               console.log('full log:', log);
//               console.log('NOT A DEFAULT LOG!', _topic);
//               break;
//           }
//         }

//         /**
//          * Result {
//           '0': '0x5596A8998Fb0A9B15861608AC869509537d42166',
//           '1': 'https://steamcommunity.com/tradeoffer/new/?partner=1337&token=XXXX',
//           __length__: 2,
//           contractAddress: '0x5596A8998Fb0A9B15861608AC869509537d42166',
//           tradeUrl: 'https://steamcommunity.com/tradeoffer/new/?partner=1337&token=XXXX'
//         }
//         */
//       })
//       .on('data', (/*log*/) => {
//         //console.log(log);
//       });
//   }

//   private decodeLog(any: any[], log: any): any {
//     return this.wallet.web3.eth.abi.decodeLog(any, log.data, log.topics);
//   }

//   private listenToEverythingOnChain() {
//     this.wallet.web3.eth.subscribe('logs', {}, (error, result) => {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log(result);
//       }
//     });
//   }

//   private async addObjectToJSONFile(
//     filePath: string,
//     newObject: any,
//   ): Promise<void> {
//     return new Promise((resolve, reject) => {
//       fs.readFile(filePath, 'utf8', (err, data) => {
//         let existingData = [];
//         if (err) {
//           if (err.code === 'ENOENT') {
//             existingData = [];
//           } else {
//             return reject(err);
//           }
//         } else {
//           existingData = JSON.parse(data);
//         }
//         existingData.push(newObject);
//         fs.writeFile(filePath, JSON.stringify(existingData), (err) => {
//           if (err) {
//             return reject(err);
//           }
//           resolve();
//         });
//       });
//     });
//   }

//   private async readJSONFile(filePath: string): Promise<any[]> {
//     return new Promise((resolve, reject) => {
//       fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//           return reject(err);
//         }
//         if (data) resolve(JSON.parse(data));
//       });
//     });
//   }

//   private async deleteObjectFromJSONFile(
//     filePath: string,
//     contractAddress: string,
//   ): Promise<void> {
//     return new Promise((resolve, reject) => {
//       fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//           return reject(err);
//         }
//         const existingData = JSON.parse(data);
//         const updatedData = existingData.filter(
//           (item) => item.contractAddress !== contractAddress,
//         );
//         fs.writeFile(filePath, JSON.stringify(updatedData), (err) => {
//           if (err) {
//             return reject(err);
//           }
//           resolve();
//         });
//       });
//     });
//   }

//   private async getBlockHeight(): Promise<number> {
//     return await this.wallet.web3.eth.getBlockNumber();
//   }
// }

// const TradeContractCreatedEventValues = [
//   {
//     type: 'address',
//     name: 'contractAddress',
//     indexed: false,
//   },
//   {
//     type: 'string',
//     name: 'tradeUrl',
//     indexed: false,
//   },
// ];

// const BuyerCommittedEventValues = [
//   {
//     type: 'string',
//     name: 'sellerTradeUrl',
//     indexed: false,
//   },
//   {
//     type: 'string',
//     name: 'buyerTradeUrl',
//     indexed: false,
//   },
//   {
//     type: 'string',
//     name: 'assetId',
//     indexed: false,
//   },
// ];

// const StatusChangeEventValues = [
//   {
//     type: 'address',
//     name: 'contractAddress',
//     indexed: false,
//   },
//   {
//     type: 'uint8',
//     name: 'newStatus',
//     indexed: false,
//   },
// ];

// enum ContractFactoryTopics {
//   TradeContractCreated = '0x869278638504c9c26660fbe4650488dc36365108eb82feb7fabf6aced413161e',
// }

// enum ContractTradeTopics {
//   BuyerCommitted = '0x6ab5ddc911c301f459ca2048a8bf13caf20ebf8cd08391089064143ad5d7370e',
//   StatusChange = '',
// }
