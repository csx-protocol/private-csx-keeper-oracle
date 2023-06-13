/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom /*of*/ } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);
  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService,
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

  // on BuyerCommitted:
  // Snapshot inventory of seller. (validate seller has item(apiFloatCheckIt and compare with contract event float))
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

  onBuyerCommitted(event: any, blockHeight: number): void {
    // TODO: Implement method

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
}

interface Snapshot {
  steamId64: string;
  inventory: any[];
  valid: boolean;
  hashNameCount: number;
}
