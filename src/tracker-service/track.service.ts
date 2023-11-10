/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, of } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ItemState,
  TrackedItem,
} from '../database/entities/primary/tracked-items/tracked-items.entity';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FloatApiService } from '../float-api/float-api.service';
import { WalletService } from '../web3-service/wallet.service';
import { TradeStatus } from '../database/database/primary/interface';
import { SecondaryDatabaseService } from '../database/database/secondary/secondary-database.service';
import { ethers } from 'ethers';

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);
  private trackedItems: TrackedItem[] = [];
  private cronEnabled = false;
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(TrackedItem, 'primaryConnection')
    private readonly trackedItemsRepository: Repository<TrackedItem>,
    private readonly sDB: SecondaryDatabaseService,
    private readonly floatService: FloatApiService,
    private readonly walletService: WalletService,
  ) {
    this._loadTrackedItems(); // Do this after web3 has been initialized up to the latest block.
  }

  // To load tracked items from the db into the in-memory list
  private async _loadTrackedItems(): Promise<void> {
    this.trackedItems = await this.trackedItemsRepository.find();
    this.cronEnabled = true;
  }

  // To track an item
  private async _trackItemWithoutApi(
    status: TradeStatus,
    contractAddress: string,
    originId: string,
    destinationId: string,
    assetId: string,
    _floatValue: number,
    _paintSeed: number,
    _paintIndex: number,
    _sellerAddress: string,
  ): Promise<void> {
    this.logger.log(
      'trackItem',
      contractAddress,
      originId,
      destinationId,
      assetId,
      _floatValue,
      _paintSeed,
      _paintIndex,
    );

    const originInventory = await this._getInventory(
      originId,
      `'trackItem:' ${originId}`,
    );

    if (originInventory === 'INVENTORY_PRIVATE') {
      this.logger.error(
        `Inventory for originId ${originId} is private. Cannot proceed.`,
      );
      return await this.walletService.confirmTrade(
        contractAddress,
        false,
        'SELLER_INVENTORY_PRIVATE',
      );
    }

    const item = originInventory.find(
      (item: { assetid: string }) => item.assetid === assetId,
    );

    if (item) {
      const destinationSimilarItemsCount = await this._getSimilarItemsCount(
        destinationId,
        item.market_hash_name,
        _floatValue,
        _paintSeed,
        _paintIndex,
      );

      // Ideally push to message broker here if the destinationSimilarItemsCount is -1 (inventory private) and let chats consume.

      const trackedItem = this.trackedItemsRepository.create({
        originId,
        destinationId,
        assetId,
        market_hash_name: item.market_hash_name,
        details: {
          floatValue: _floatValue,
          paintSeed: _paintSeed,
          paintIndex: _paintIndex,
        },
        similarItemsCount: destinationSimilarItemsCount,
        state: ItemState.TRACKING_SELLER,
        contractAddress: contractAddress,
        sellerAddress: _sellerAddress,
      });

      await this.trackedItemsRepository.save(trackedItem);

      // Add the tracked item to the in-memory list
      this.trackedItems.push(trackedItem);

      this.logger.log(
        `[${contractAddress}] Start tracking item ${assetId} from ${originId} to ${destinationId}`,
      );
    } else {
      const currentStatus = await this.walletService.getTradeStatus(
        contractAddress,
      );

      console.log('currentStatus', currentStatus);
      console.log('status', status);

      if (status != currentStatus) {
        this.logger.error(
          `[${contractAddress}] No item with assetId ${assetId} found in the seller ${originId} inventory, no tracking stored.`,
        );
        return;
      }
    }
  }

  // To track an item with api key
  private async _trackItemWithApi(
    contractAddress: string,
    originId: string,
    destinationId: string,
    assetId: string,
    _itemMarketName: string,
    _floatValue: number,
    _paintSeed: number,
    _paintIndex: number,
    _sellerAddress: string,
  ) {
    this.logger.log(
      'trackItem with api',
      contractAddress,
      originId,
      destinationId,
      assetId,
      _floatValue,
      _paintSeed,
      _paintIndex,
    );
    const trackedItem = this.trackedItemsRepository.create({
      originId,
      destinationId,
      assetId,
      market_hash_name: _itemMarketName,
      details: {
        floatValue: _floatValue,
        paintSeed: _paintSeed,
        paintIndex: _paintIndex,
      },
      similarItemsCount: -2,
      state: ItemState.TRACKING_API,
      contractAddress: contractAddress,
      sellerAddress: _sellerAddress,
    });

    await this.trackedItemsRepository.save(trackedItem);

    // Add the tracked item to the in-memory list
    this.trackedItems.push(trackedItem);

    this.logger.log(
      `[${contractAddress}] Start api tracking item ${assetId} from ${originId} to ${destinationId}`,
    );
  }

  public async trackItem(
    sellerAddress: string,
    status: TradeStatus,
    contractAddress: string,
    originId: string,
    destinationId: string,
    assetId: string,
    _itemMarketName: string,
    _floatValue: number,
    _paintSeed: number,
    _paintIndex: number,
  ) {
    const apiUser = await this.sDB.getUser(sellerAddress);
    this.logger.log('apiUser', apiUser);
    if (!apiUser.error && apiUser.data.apiKey) {
      const isApiKeyValid = await this.sDB.isApiKeyValid(apiUser.data.apiKey);

      if (!isApiKeyValid) {
        this._trackItemWithoutApi(
          status,
          contractAddress,
          originId,
          destinationId,
          assetId,
          _floatValue,
          _paintSeed,
          _paintIndex,
          sellerAddress,
        );
      } else {
        this._trackItemWithApi(
          contractAddress,
          originId,
          destinationId,
          assetId,
          _itemMarketName,
          _floatValue,
          _paintSeed,
          _paintIndex,
          sellerAddress,
        );
      }
    } else {
      this._trackItemWithoutApi(
        status,
        contractAddress,
        originId,
        destinationId,
        assetId,
        _floatValue,
        _paintSeed,
        _paintIndex,
        sellerAddress,
      );
    }
  }

  // To check tracked items periodically
  isCheckingItems = false;
  private async _checkTrackedItems(): Promise<void> {
    if (this.trackedItems.length === 0) {
      //this.logger.verbose('No tracked items.');
      return;
    }

    this.isCheckingItems = true;

    this.logger.log(`Checking ${this.trackedItems.length} tracked items.`);

    let count = 0;

    for (const trackedItem of this.trackedItems) {
      try {
        count++;
        this.logger.warn(
          `Checking item ${count} out of ${this.trackedItems.length} tracked items.`,
        );

        this.logger.log(
          `checking tracked item ${trackedItem.id} ${trackedItem.state} ${trackedItem.originId} ${trackedItem.destinationId} ${trackedItem.market_hash_name} ${trackedItem.details.floatValue} ${trackedItem.details.paintSeed} ${trackedItem.details.paintIndex}`,
        );

        switch (trackedItem.state) {
          case ItemState.TRACKING_SELLER:
            await this.__checkSellerInventory(trackedItem);
            break;
          case ItemState.TRACKING_BUYER:
            await this.__checkBuyerInventory(trackedItem);
            break;
          case ItemState.TRACKING_API:
            await this.__checkApiTrade(trackedItem);
            break;
        }
      } catch (error) {
        this.logger.error(
          `Error processing tracked item with ID: ${trackedItem.id}`,
          error.message,
        );
      }
    }
    await this.cleanupCache();
    this.logger.warn('Done checking items.');
    this.isCheckingItems = false;
  }

  // To check if the item is still in the seller's inventory
  private async __checkSellerInventory(
    trackedItem: TrackedItem,
  ): Promise<void> {
    const originInventory = await this._getInventory(
      trackedItem.originId,
      `'__checkSellerInventory': ${trackedItem.id}`,
    );

    const item = originInventory.find(
      (item: { assetid: string }) => item.assetid === trackedItem.assetId,
    );

    if (!item) {
      this.logger.log(
        `Item ${trackedItem.id} has been removed from ${trackedItem.originId}'s inventory.`,
      );

      // update the item state to tracking buyer
      trackedItem.state = ItemState.TRACKING_BUYER;
      await this.trackedItemsRepository.save(trackedItem);
      await this.__checkBuyerInventory(trackedItem);
    }
  }

  // To check if the item is in the buyer's inventory
  private async __checkBuyerInventory(trackedItem: TrackedItem): Promise<void> {
    const similarItemsInTargetInventory = await this._getSimilarItemsCount(
      trackedItem.destinationId,
      trackedItem.market_hash_name,
      trackedItem.details.floatValue,
      trackedItem.details.paintSeed,
      trackedItem.details.paintIndex,
    );

    //
    if (similarItemsInTargetInventory === -1) {
      console.log('Inventory is private');
    }
    //return this._confirmTrade(trackedItem, true); // TODO: handle this case (-1 = inv private), by dismissing check buyer's inventory in the _checkTrackedItems() method;

    if (similarItemsInTargetInventory > trackedItem.similarItemsCount) {
      this.logger.log(
        `Item ${trackedItem.id} has moved from ${trackedItem.originId} to ${trackedItem.destinationId}.`,
      );
      // Release the item from the csx-market
      this._confirmTrade(trackedItem, true, 'DELIVERED');
    }
  }

  private async __checkApiTrade(trackedItem: TrackedItem): Promise<void> {
    const isTradeMadeBody: isTradeMadeBody = {
      senderAddress: trackedItem.sellerAddress,
      senderAssetId: trackedItem.assetId,
      recipientSteamId64: trackedItem.destinationId,
    };
    const isTradeMade: isResponseDto = await this.isApiTradeMade(
      isTradeMadeBody,
    );
    if (isTradeMade.error) {
      this.logger.error(
        `Error in __checkApiTrade: ${isTradeMade.error} id: ${trackedItem.id}`,
      );
      return;
    }
    if (isTradeMade.is) {
      this.logger.log(
        `Item ${trackedItem.id} has moved from ${trackedItem.originId} to ${trackedItem.destinationId}.`,
      );
      // Release the item from the csx-market
      this._confirmTrade(trackedItem, true, 'DELIVERED');
    }
  }

  private _confirmTrade(
    trackedItem: TrackedItem,
    veridict: boolean,
    message: string,
  ) {
    try {
      this.walletService
        .confirmTrade(trackedItem.contractAddress, veridict, message)
        .then((res) => {
          this.logger.log(
            `Confirmed trade ${trackedItem.contractAddress} with result: $`,
          );
          this.logger.log(res);
        })
        .catch((error) => {
          this.logger.error(
            `Error confirming trade ${trackedItem.contractAddress}: ${trackedItem.id}`,
            error,
          );
          this.logger.error(error);
          console.log('Revert reason:', error.reason);
          console.log('Transaction:', error.transaction);
        });
    } catch (error) {
      this.logger.error(`Error confirming trade: ${trackedItem.id}`, error);
      this.logger.error(error);
    }
  }

  // To get the inventory of a user
  /** Code 403: Private inventory
   * {
      "error": "Could not retrieve user inventory. Make sure profile and inventory is public. (403)",
      "code": 403
      }
   */

  private inventoryCache: { [key: string]: { timestamp: number; data: any } } =
    {};
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private async _getInventory(
    _steamId64: string,
    callerName: string,
  ): Promise<any> {
    this.logger.warn(`_getInventory() called by ${callerName}`);
    const currentTimestamp = Date.now();

    // Check if data exists in cache and is recent
    if (
      this.inventoryCache[_steamId64] &&
      currentTimestamp - this.inventoryCache[_steamId64].timestamp <
        this.CACHE_TIME_MS
    ) {
      this.logger.warn('Using cached data');
      return this.inventoryCache[_steamId64].data;
    }

    // If there's an ongoing request for this _steamId64, wait for its completion and return its result
    if (this.ongoingRequests.has(_steamId64)) {
      this.logger.warn(
        `_getInventory() Waiting for ongoing request for ${_steamId64} to end`,
      );
      return await this.ongoingRequests.get(_steamId64);
    }

    const fetchData = async () => {
      const response = await firstValueFrom(
        this.httpService
          .get<InventoryResponse>(
            `https://api.steamapis.com/steam/inventory/${_steamId64}/730/2?api_key=${this.config.get<string>(
              'STEAMAPIS_KEY',
            )}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              const errorResult = error.response.data as {
                error: string;
                code: number;
              };
              this.logger.error('Error in _getInventory: ', errorResult.error);

              if (
                errorResult.code === 403 &&
                errorResult.error.includes('Could not retrieve user inventory')
              ) {
                return of('INVENTORY_PRIVATE'); // Return the special string here
              }
              throw new Error(`An error happened in _getInventory! ${error}`);
            }),
          ),
      );

      if (typeof response === 'string' && response === 'INVENTORY_PRIVATE') {
        return 'INVENTORY_PRIVATE';
      }

      const { data } = response as unknown as AxiosResponse<
        InventoryResponse,
        any
      >;

      const merged = [];
      for (const _asset of data.assets) {
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

      this.inventoryCache[_steamId64] = {
        timestamp: currentTimestamp,
        data: merged,
      };
      return merged;
    };

    const fetchDataPromise = fetchData();

    // Store the promise in the ongoingRequests map
    this.ongoingRequests.set(_steamId64, fetchDataPromise);

    try {
      const result = await fetchDataPromise;

      // Remove the promise from the map after its completion
      this.ongoingRequests.delete(_steamId64);

      return result;
    } catch (error) {
      // Remove the promise from the map in case of an error
      this.ongoingRequests.delete(_steamId64);
      this.logger.error('Catched: _getInventory in track.service', error);
    }
  }

  private CACHE_TIME_MS = 10 * 1000; // 30 seconds
  private async cleanupCache() {
    const currentTimestamp = Date.now();
    for (const steamId in this.inventoryCache) {
      if (
        currentTimestamp - this.inventoryCache[steamId].timestamp >=
        this.CACHE_TIME_MS
      ) {
        delete this.inventoryCache[steamId];
      }
    }
  }

  // To get the number of similar items in the target inventory
  private async _getSimilarItemsCount(
    destinationId: string,
    market_hash_name: string,
    targetFloatValue: number,
    targetPaintSeed: number,
    targetPaintIndex: number,
  ): Promise<number> {
    const targetInventory = await this._getInventory(
      destinationId,
      `_getSimilarItemsCount ${destinationId}`,
    );

    if (targetInventory === 'INVENTORY_PRIVATE') return -1; // TODO: handle this case, by dismissing check buyer's inventory in the _checkTrackedItems() method;

    let similarItemsCount = 0;

    const sameMarketHashNameItems = targetInventory.filter(
      (item: targetItem) => item.market_hash_name === market_hash_name,
    );

    for (const item of sameMarketHashNameItems) {
      const inspectAction = item.actions.find(
        (action: any) => action.name === 'Inspect in Game...',
      );

      if (inspectAction) {
        const dValue = inspectAction.link.match(/D(\d+)/);
        if (!dValue || !dValue[1]) {
          continue;
        }

        const inspectLink = `steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S${destinationId}A${item.assetid}D${dValue[1]}`;
        const fetchFloat = await this.floatService
          .getFloat(inspectLink)
          .catch((error) => {
            this.logger.error('Error in _getSimilarItemsCount: ', error);
            // If the error is not catched, turn of the isCheckingItems flag
            // this.logger.warn('Setting isCheckingItems to false.');
            // this.isCheckingItems = false;
          });
        const floatResults = fetchFloat.data.iteminfo;

        // Check if the float details of the current item match the provided details
        if (
          targetFloatValue === floatResults.floatvalue &&
          targetPaintSeed === floatResults.paintseed &&
          targetPaintIndex === floatResults.paintindex
        ) {
          similarItemsCount++;
        }
      }
    }

    return similarItemsCount;
  }

  // Cron job to check tracked items periodically
  @Cron(CronExpression.EVERY_MINUTE)
  public async handleCron(): Promise<void> {
    if (!this.cronEnabled) return this.logger.warn('Cron is disabled.');
    if (this.isCheckingItems) {
      return this.logger.warn('Already checking items.');
    }
    await this._checkTrackedItems();
  }

  public async removeTrackedItem(contractAddress: string): Promise<void> {
    this.logger.warn(
      `Removing tracked item with contract address: ${contractAddress}`,
    );
    this.trackedItems = this.trackedItems.filter(
      (item) =>
        item.contractAddress.toLowerCase() !== contractAddress.toLowerCase(),
    );

    const trackedItem = await this.trackedItemsRepository.findOne({
      where: { contractAddress },
    });

    if (trackedItem != null) {
      this.trackedItemsRepository.delete(trackedItem);
    } else {
      this.logger.error(
        `Tracked item with contract address: ${contractAddress} not found.`,
      );
    }
  }

  ///////////////////////////////////////////////////////////////

  // public async isAssetIdInInventory(
  //   _steamId64: string,
  //   assetId: string,
  // ): Promise<boolean> {
  //   const inventory = await this._getInventory(_steamId64);
  //   const item = inventory.find(
  //     (item: { assetid: string }) => item.assetid === assetId,
  //   );
  //   return item ? true : false;
  // }

  ///////////////////////////////////////////////////////////////

  async isApiTradeMade(body: isTradeMadeBody): Promise<isResponseDto> {
    try {
      const userResponse = await this.sDB.getUser(body.senderAddress);

      if (userResponse.error) {
        return {
          is: false,
          error: userResponse.error,
        } as isResponseDto;
      }

      const apiKey = userResponse.data.apiKey;

      // const isApiKeyValid = await this.sDB.isApiKeyValid(apiKey);

      // if (!isApiKeyValid) {
      //   return {
      //     is: false,
      //     error: 'API_KEY_INVALID',
      //   } as isResponseDto;
      // }

      const offersResponse = await axios.get(
        'https://api.steampowered.com/IEconService/GetTradeOffers/v1/',
        {
          params: {
            key: apiKey,
            get_sent_offers: true,
            get_received_offers: true,
            active_only: false,
            historical_only: true,
            language: 'en_us',
          },
        },
      );

      const sentOffers = offersResponse.data.response.trade_offers_sent;
      const receivedOffers = offersResponse.data.response.trade_offers_received;

      const matchingSentOffer = await this._findMatchingOffer(
        sentOffers,
        body.senderAssetId,
        body.recipientSteamId64,
      );
      const matchingReceivedOffer = await this._findMatchingOffer(
        receivedOffers,
        body.senderAssetId,
        body.recipientSteamId64,
      );

      if (matchingSentOffer || matchingReceivedOffer) {
        return {
          is: true,
        } as isResponseDto;
      } else {
        return {
          is: false,
        } as isResponseDto;
      }
    } catch (error) {
      return {
        is: false,
        error: error.message,
      } as isResponseDto;
    }
  }

  private async _findMatchingOffer(
    offers: any[],
    senderAssetId: string,
    recipientSteamId64: string,
  ): Promise<boolean> {
    if (!offers) return false;
    const recipientSteamId3 =
      steamID64ToSteamID3(recipientSteamId64).toLowerCase();
    return offers.find(
      (offer: {
        accountid_other: any;
        items_to_give?: any[];
        items_to_receive?: any[];
        trade_offer_state: number;
      }) => {
        const itemsToGiveMatch = offer.items_to_give?.some(
          (item) =>
            item.assetid.toString() == senderAssetId &&
            item.appid == 730 &&
            offer.accountid_other.toString().toLowerCase() == recipientSteamId3,
        );
        const itemsToReceiveMatch = offer.items_to_receive?.some(
          (item) =>
            item.assetid.toString() == senderAssetId &&
            item.appid == 730 &&
            offer.accountid_other.toString().toLowerCase() == recipientSteamId3,
        );

        return (
          (itemsToGiveMatch || itemsToReceiveMatch) &&
          offer.trade_offer_state == 3
        );
      },
    );
  }
}

type targetItem = {
  market_hash_name: string;
  floatValue: number;
  paintSeed: number;
  paintIndex: number;
};

// class InventoryPrivateError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = 'InventoryPrivateError';
//   }
// }

export interface isTradeMadeBody {
  senderAddress: string;
  senderAssetId: string;
  recipientSteamId64: string;
}

export interface isResponseDto {
  is: boolean;
  error?: string;
}

function steamID64ToSteamID3(steamID64: string): string {
  const steamID3 = BigInt(steamID64) - BigInt('76561197960265728');
  return steamID3.toString();
}
