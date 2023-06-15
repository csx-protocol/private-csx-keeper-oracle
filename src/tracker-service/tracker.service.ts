/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom /*of*/ } from 'rxjs';
import { AxiosError } from 'axios';
import { FloatApiService } from '../float-api/float-api.service';
import { WalletService } from '../web3-service/wallet.service';
import { environment } from 'src/web3-service/environment';
import { TrackService } from './track.service';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly floatService: FloatApiService,
    private readonly walletService: WalletService,
    private config: ConfigService,
    private readonly trackService: TrackService
  ) {
    this.logger.log('TrackerService dependencies injected');
  }

  async getInventory(_steamId64: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<InventoryResponse>(
            `https://api.steamapis.com/steam/inventory/${_steamId64}/730/2?api_key=${this.config.get<string>(
              'STEAMAPIS_KEY',
            )}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw 'An error happened!x';
            }),
          ),
      );
      //return data;
      const merged = [];
      for (const _asset of data.assets) {
        //..
        const description = data.descriptions.find(
          (desc) =>
            desc.classid === _asset.classid &&
            desc.instanceid === _asset.instanceid,
        );

        if (description) {
          merged.push({
            appid: _asset.appid,
            contextid: _asset.contextid,
            assetid: _asset.assetid,
            classid: _asset.classid,
            instanceid: _asset.instanceid,
            amount: _asset.amount,
            ...description,
          });
        }
      }
      return merged;
    } catch (error) {
      console.log('ERRRRR!!!!', error);
    }
  }

  async runDemo(_steamId64: string) {
    return await this.getInventory(_steamId64);
  }

  // 

  // on BuyerCommitted:
  // Snapshot inventory of seller. (validate seller has item name and remember count)
  // Snapshot inventory of buyer (check if buyer has market_hash_name and remember count).

  // on SellerCommitted:
  // Snapshot inventory of seller. (validate seller doest not has item anymore)
  // Snapshot inventory of buyer (check if buyer has market_hash_name and remember count + 1).

  // on SellerConfirmed:
  // End interval.

  // on BuyerConfirmed:
  // End interval.

  // Track Item in Inventory.
  // Input assetId,

  async onBuyerCommitted(event: any, blockHeight: number): Promise<void> {
    // Validate if float, paint seed, pattern index is same in contract and inspect url.
    // If not, cancel trade and refund.

    //
    const [isValid, assetId] = await this.validateItem(event.contractAddress);
    if (!isValid) {
      // Cancel trade and refund.
      // return;
    }

    // data: '225482466+EP2Wgs2R||225482469+lKCMUg5E||0xd336c5e997055bce143060745dfa2a5e161c5681||1489077140000000000'
    // 225482466 is the seller partnerId we need to convert to Steamid64
    // 225482469 is the buyer partnerId we need to conver to Steamid64

    const data = event.data.split('||');
    const sellerPartnerId = data[0].split('+')[0];
    const buyerPartnerId = data[1].split('+')[0];

    const sellerPartnerIdInt = parseInt(sellerPartnerId);
    const buyerPartnerIdInt = parseInt(buyerPartnerId);

    const sellerSteamId64 = `7656119${sellerPartnerIdInt + 7960265728}`;
    const buyerSteamId64 = `7656119${buyerPartnerIdInt + 7960265728}`;

    // trackItem(originId: string, destinationId: string, assetId: string): Promise<void>
    // originId = seller SteamId64
    // destinationId = buyer SteamId64
    // assetId = item's assetId in seller inventory
    this.trackService.trackItem(sellerSteamId64, buyerSteamId64, assetId);

    // TODO: Implement method

    // Fetch inspectURL, float, paint seed, pattern index and store to db.
    // Check if item is in seller inventory. ()
    // If so, check if seller has market_hash_name and remember count.
    // Start interval check if item is in seller inventory.
    //
    // Interval check if item is in buyer inventory.
    // If so, check if buyer has market_hash_name and remember count + 1.

    console.log('Tracker: onBuyerCommitted', event, blockHeight);

    // Can we make a valid inspect url from partnerID and assetID or we just call contract and then inspect url?

    /*
      contractAddress: '0x60B0705084f3B7C04b8c2e7a6D747DA1b1702a1e',
      newStatus: '2',
      data: '225482466+EP2Wgs2R||225482466+lKCMUg5E||0x16ad20e2d2f5fcb50ad9879671f51ae2ca9a93fe||44661960000000000'

      event TradeContractStatusChange(
        address contractAddress,
        TradeStatus,
        string data,
        address sellerAddress,
        address buyerAddress
      );

      function onStatusChange(TradeStatus status, string memory data, address sellerAddress, address buyerAddress);

      string memory data = string(
            abi.encodePacked(
                Strings.toString(sellerTradeUrl.partner),
                "+",
                sellerTradeUrl.token,
                "||",
                Strings.toString(_buyerTradeUrl.partner),
                "+",
                _buyerTradeUrl.token,
                "||",
                Strings.toHexString(buyer),
                "||",
                Strings.toString(weiPrice)
            )
        );

      factoryContract.onStatusChange(status, data, seller, buyer);

    */

    // Snapshot inventory of seller. (validate seller has item(apiFloatCheckIt and compare with contract event float))
    // const sellerSnapshot: Snapshot = {
    //   steamId64: event.seller,
    //   inventory: [],
    //   valid: false,
    //   hashNameCount: 0,
    // };

    // Snapshot inventory of buyer (check if buyer has market_hash_name and remember count).
  }

  onSellerCommitted(): void {
    // TODO: Implement method
  }

  onSellerConfirmed(): void {
    // TODO: Implement method
  }

  onBuyerConfirmed(): void {
    // TODO: Implement method
  }

  onSellerCancelledAfterBuyerCommitted(): void {
    // TODO: Implement method
  }

  /**
   * Validates if the item info from the contract is the same as the item info from the inspect url.
   */

  async validateItem(contractAddress: string): Promise<[boolean, string]> {
    try {
      const contract = await this._getFactoryContract();
  
      const results = await contract.methods.getTradeDetailsByAddress(contractAddress).call({ from: this.walletService.wallet.myAccount });
      
      const onChainInfo = this._extractChainItemInfo(results.skinInfo, results.assetId);
  
      const fetchedData = await this.floatService.getFloat(results.inspectLink);
      const steamInfo = this._extractSteamItemInfo(fetchedData.data.iteminfo);
  
      const validationResults = this._validateItemInfo(onChainInfo, steamInfo);
  
      console.log(`Item validation results: ${JSON.stringify(validationResults, null, 2)}`);
  
      const isValid = Object.values(validationResults).every((result: ValidationResult) => result.isEqual);
  
      console.log(`Item validation result: ${isValid ? 'Valid' : 'Invalid'}`);
      return [isValid, results.assetId];
    } catch (error) {
      console.error(`Failed to validate item ${contractAddress}`, error);
    }
  }
  
  private _extractChainItemInfo(skinInfo: any, assetId: string): ItemInfo {
    return {
      floatValue: JSON.parse(skinInfo.floatValues)[2],
      paintSeed: parseInt(skinInfo.paintSeed, 10),
      paintIndex: parseInt(skinInfo.paintIndex, 10),
      assetId: parseInt(assetId, 10)
    };
  }
  
  private _extractSteamItemInfo(itemInfo: any): ItemInfo {
    return {
      floatValue: itemInfo.floatvalue,
      paintSeed: itemInfo.paintseed,
      paintIndex: itemInfo.paintindex,
      assetId: itemInfo.a
    };
  }
  
  private _validateItemInfo(onChainInfo: ItemInfo, steamInfo: ItemInfo): ValidationResults {
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
      environment.contractFactory.address,
      environment.contractFactory.abi,
    );
  }
}

type ItemInfo = {
  floatValue: number;
  paintSeed: number;
  paintIndex: number;
  assetId: number;
};

type ValidationResult = {
  isEqual: boolean;
  onChainValue: number;
  steamValue: number;
};

type ValidationResults = {
  floatValue: ValidationResult;
  paintSeed: ValidationResult;
  paintIndex: ValidationResult;
};