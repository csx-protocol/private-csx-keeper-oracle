/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
// import { catchError, firstValueFrom /*of*/ } from 'rxjs';
// import { AxiosError } from 'axios';
import { FloatApiService } from '../float-api/float-api.service';
import { WalletService } from '../web3-service/wallet.service';
import { environment as envWeb3 } from '../web3-service/environment';
import { TrackService } from './track.service';
import { PrimaryDatabaseService } from '../database/database/primary/database.service';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly floatService: FloatApiService,
    private readonly walletService: WalletService,
    private config: ConfigService,
    private readonly trackService: TrackService,
    private readonly pDB: PrimaryDatabaseService,
  ) {
    this.logger.log('TrackerService dependencies injected');
  }

  // async getInventory(_steamId64: string): Promise<any> {
  //   try {
  //     const { data } = await firstValueFrom(
  //       this.httpService
  //         .get<InventoryResponse>(
  //           `https://api.steamapis.com/steam/inventory/${_steamId64}/730/2?api_key=${this.config.get<string>(
  //             'STEAMAPIS_KEY',
  //           )}`,
  //         )
  //         .pipe(
  //           catchError((error: AxiosError) => {
  //             this.logger.error(error.response.data);
  //             throw 'An error happened!x';
  //           }),
  //         ),
  //     );
  //     //return data;
  //     const merged = [];
  //     for (const _asset of data.assets) {
  //       //..
  //       const description = data.descriptions.find(
  //         (desc) =>
  //           desc.classid === _asset.classid &&
  //           desc.instanceid === _asset.instanceid,
  //       );

  //       if (description) {
  //         merged.push({
  //           appid: _asset.appid,
  //           contextid: _asset.contextid,
  //           assetid: _asset.assetid,
  //           classid: _asset.classid,
  //           instanceid: _asset.instanceid,
  //           amount: _asset.amount,
  //           ...description,
  //         });
  //       }
  //     }
  //     return merged;
  //   } catch (error) {
  //     console.log('tracker:getInventory ERRRRR!', error);
  //   }
  // }

  // async runDemo(_steamId64: string) {
  //   return await this.getInventory(_steamId64);
  // }

  // on BuyerCommitted:
  // Check if data on-chain and inspect url is the same. ---> If not, cancel trade and refund.

  // Check if assetId is present in seller inventory. ---> If not, cancel trade and refund.
  // If Present:
  //  Snapshot inventory of buyer (check if buyer has market_hash_name with the same float details and remember the count).

  // on BuyerCancelled:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // on SellerCommitted:
  // Start interval check of buyer inventory (check if buyer has market_hash_name with the same float details and remember the count + 1).

  // on SellerCancelledAfterBuyerCommitted:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // on Completed:

  // on SellerConfirmed:
  // ???

  // on BuyerConfirmed:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  //

  // async onBuyerCommitted(event: any, blockHeight: number): Promise<void> {

  //   //Validate if buyer inv is public?

  //   //
  //   // const [isValid, assetId, validationResults] = await this.validateIsItemInfoAndInspectSame(event.contractAddress);
  //   // console.log('Validation Results', validationResults);

  //   // if (!isValid) {
  //   //   this.logger.warn('Item is not valid, cancel trade and refund');
  //   //   // TODO: Cancel Trade and Refund call here.
  //   //   return;
  //   // }

  //   // const data = event.data.split('||');
  //   // const sellerPartnerId = data[0].split('+')[0];
  //   // const buyerPartnerId = data[1].split('+')[0];

  //   // const sellerPartnerIdInt = parseInt(sellerPartnerId);
  //   // const buyerPartnerIdInt = parseInt(buyerPartnerId);

  //   // const sellerSteamId64 = `7656119${sellerPartnerIdInt + 7960265728}`;
  //   // const buyerSteamId64 = `7656119${buyerPartnerIdInt + 7960265728}`;

  //   // this.trackService.trackItem(
  //   //   sellerSteamId64,
  //   //   buyerSteamId64,
  //   //   assetId,
  //   //   validationResults.floatValue.steamValue,
  //   //   validationResults.paintSeed.steamValue,
  //   //   validationResults.paintIndex.steamValue,
  //   // );

  //   // trackItem(originId: string, destinationId: string, assetId: string): Promise<void>
  //   // originId = seller SteamId64
  //   // destinationId = buyer SteamId64
  //   // assetId = item's assetId in seller inventory

  //   // TODO: Implement method

  //   // Fetch inspectURL, float, paint seed, pattern index and store to db.
  //   // Check if item is in seller inventory. ()
  //   // If so, check if seller has market_hash_name and remember count.
  //   // Start interval check if item is in seller inventory.
  //   //
  //   // Interval check if item is in buyer inventory.
  //   // If so, check if buyer has market_hash_name and remember count + 1.

  //   console.log('Tracker: onBuyerCommitted', event, blockHeight);

  //   // Can we make a valid inspect url from partnerID and assetID or we just call contract and then inspect url?

  //   /*
  //     contractAddress: '0x60B0705084f3B7C04b8c2e7a6D747DA1b1702a1e',
  //     newStatus: '2',
  //     data: '225482466+EP2Wgs2R||225482466+lKCMUg5E||0x16ad20e2d2f5fcb50ad9879671f51ae2ca9a93fe||44661960000000000'

  //     event TradeContractStatusChange(
  //       address contractAddress,
  //       TradeStatus,
  //       string data,
  //       address sellerAddress,
  //       address buyerAddress
  //     );

  //     function onStatusChange(TradeStatus status, string memory data, address sellerAddress, address buyerAddress);

  //     string memory data = string(
  //           abi.encodePacked(
  //               Strings.toString(sellerTradeUrl.partner),
  //               "+",
  //               sellerTradeUrl.token,
  //               "||",
  //               Strings.toString(_buyerTradeUrl.partner),
  //               "+",
  //               _buyerTradeUrl.token,
  //               "||",
  //               Strings.toHexString(buyer),
  //               "||",
  //               Strings.toString(weiPrice)
  //           )
  //       );

  //     factoryContract.onStatusChange(status, data, seller, buyer);

  //   */

  //   // Snapshot inventory of seller. (validate seller has item(apiFloatCheckIt and compare with contract event float))
  //   // const sellerSnapshot: Snapshot = {
  //   //   steamId64: event.seller,
  //   //   inventory: [],
  //   //   valid: false,
  //   //   hashNameCount: 0,
  //   // };

  //   // Snapshot inventory of buyer (check if buyer has market_hash_name and remember count).
  // }

  async onSellerCommitted(event: any, blockHeight: number): Promise<void> {
    //console.log('Tracker: onSellerCommitted', event, blockHeight);

    const data = event.data.split('||');
    const sellerPartnerId = data[0].split('+')[0];
    const buyerPartnerId = data[1].split('+')[0];

    const sellerPartnerIdInt = parseInt(sellerPartnerId);
    const buyerPartnerIdInt = parseInt(buyerPartnerId);

    const sellerSteamId64 = `7656119${sellerPartnerIdInt + 7960265728}`;
    const buyerSteamId64 = `7656119${buyerPartnerIdInt + 7960265728}`;

    // const [isValid, assetId, validationResults] = await this.validateIsItemInfoAndInspectSame(event.contractAddress);

    const cEntity = await this.pDB.findByContractAddress(event.contractAddress);

    this.trackService.trackItem(
      event.sellerAddress,
      event.newStatus,
      event.contractAddress,
      sellerSteamId64,
      buyerSteamId64,
      cEntity.assetId,
      cEntity.itemMarketName,
      cEntity.details.floatValue,
      cEntity.details.paintSeed,
      cEntity.details.paintIndex,
    );
  }

  // async onCompleted(event: any, blockHeight: number): Promise<void> {
  //   console.log('Tracker: onCompleted', event, blockHeight);
  //   this.trackService.removeTrackedItem(event.contractAddress);
  // }

  async removeTrackedItem(contractAddress: string): Promise<void> {
    await this.trackService.removeTrackedItem(contractAddress);
  }

  // NEW NEW NEW NEW NEW NEW NEW NEW NEW

  // on BuyerCommitted:
  // (here) Check if data on-chain and inspect url is the same. ---> If not, cancel trade and refund.
  // (in track.ts) Check if assetId is present in seller inventory. ---> If not, cancel trade and refund.

  // on BuyerCancelled:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // on SellerCommitted:
  // Snapshot inventory of buyer (check if buyer has market_hash_name with the same float details and remember the count).
  // Start interval of seller inventory (check if assetId is not present anymore)
  // If not present anymore:
  // Change status on tracked item in db.
  // Stop seller interval
  // Start interval of buyer inventory (check if similarItemsCount + 1).

  // on SellerCancelledAfterBuyerCommitted:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // on Completed:
  // If they exists:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // on Disputed:
  // Store dispute in db (isDisputed=true & disputeReason).
  // If they exists:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // on Resolved:
  // If they exists:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // on Clawbacked:
  // If they exists:
  // Remove trackedItem from in-memory list.
  // Remove trackedItem from db.

  // ENDOFNEW ENDOFNEW ENDOFNEW ENDOFNEW

  /**
   * Validates if the item info from the contract is the same as the item info from the inspect url.
   */

  async validateIsItemInfoAndInspectSame(
    contractAddress: string,
  ): Promise<[boolean, string, ValidationResults]> {
    try {
      const contract = await this._getFactoryContract();

      //const chainResults = await contract.methods.getTradeDetailsByAddress(contractAddress).call({ from: this.walletService.wallet.myAccount });
      const chainResults = await contract.getTradeDetailsByAddress(
        contractAddress,
      );

      const onChainInfo = this._extractChainItemInfo(
        chainResults.skinInfo,
        chainResults.assetId,
      );

      const steamResults = await this.floatService.getFloat(
        chainResults.inspectLink,
      );
      const steamInfo = this._extractSteamItemInfo(steamResults.data.iteminfo);

      const validationResults = this._validateItemInfo(onChainInfo, steamInfo);

      //console.log(`Item validation results: ${JSON.stringify(validationResults, null, 2)}`);

      const isValid = Object.values(validationResults).every(
        (result: ValidationResult) => result.isEqual,
      );

      //console.log(`Item validation result: ${isValid ? 'Valid' : 'Invalid'}`);
      return [isValid, chainResults.assetId, validationResults];
    } catch (error) {
      this.logger.error(
        `Failed to validate item ${contractAddress} trying again`,
        error,
      );
      this.validateIsItemInfoAndInspectSame(contractAddress);
    }
  }

  private _extractChainItemInfo(skinInfo: any, assetId: string): ItemInfo {
    return {
      floatValue: JSON.parse(skinInfo.floatValues)[2],
      paintSeed: parseInt(skinInfo.paintSeed, 10),
      paintIndex: parseInt(skinInfo.paintIndex, 10),
      assetId: parseInt(assetId, 10),
    };
  }

  private _extractSteamItemInfo(itemInfo: any): ItemInfo {
    return {
      floatValue: itemInfo.floatvalue,
      paintSeed: itemInfo.paintseed,
      paintIndex: itemInfo.paintindex,
      assetId: itemInfo.a,
    };
  }

  private _validateItemInfo(
    onChainInfo: ItemInfo,
    steamInfo: ItemInfo,
  ): ValidationResults {
    return {
      floatValue: {
        isEqual: onChainInfo.floatValue === steamInfo.floatValue,
        onChainValue: onChainInfo.floatValue,
        steamValue: steamInfo.floatValue,
      },
      paintSeed: {
        isEqual: onChainInfo.paintSeed === steamInfo.paintSeed,
        onChainValue: onChainInfo.paintSeed,
        steamValue: steamInfo.paintSeed,
      },
      paintIndex: {
        isEqual: onChainInfo.paintIndex === steamInfo.paintIndex,
        onChainValue: onChainInfo.paintIndex,
        steamValue: steamInfo.paintIndex,
      },
    };
  }

  private async _getFactoryContract() {
    return this.walletService.wallet.connectContract(
      envWeb3.contractFactory.address,
      envWeb3.contractFactory.abi,
    );
  }
}

export type ItemInfo = {
  floatValue: number;
  paintSeed: number;
  paintIndex: number;
  assetId: number;
};

export type ValidationResult = {
  isEqual: boolean;
  onChainValue: number;
  steamValue: number;
};

export type ValidationResults = {
  floatValue: ValidationResult;
  paintSeed: ValidationResult;
  paintIndex: ValidationResult;
};
