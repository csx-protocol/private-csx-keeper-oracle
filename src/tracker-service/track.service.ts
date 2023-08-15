/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  catchError,
  firstValueFrom
} from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackedItem } from '../database/entities/tracked-items/tracked-items.entity';
import { AxiosError } from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FloatApiService } from '../float-api/float-api.service';

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);
  private trackedItems: TrackedItem[] = [];
  private cronEnabled = false;
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(TrackedItem)
    private trackedItemsRepository: Repository<TrackedItem>,
    private floatService: FloatApiService,
  ) {
    this._loadTrackedItems(); // Do this after web3 has been initialized up to the latest block.
  }

  // To load tracked items from the db into the in-memory list
  private async _loadTrackedItems(): Promise<void> {
    this.trackedItems = await this.trackedItemsRepository.find();
    this.cronEnabled = true;
  }

  // To track an item
  // TODO: Re-arrange flow of tracking items
  // So we first check seller/origin inventory first to see if the item is still there
  // but we need to do it a bit differently because the trackItem function is called
  // right now when the buyer has committed, so we need to check the seller inventory
  // like we do but in another function, and then we need to track the item, by assetId,
  // market_hash_name, floatValue, paintSeed, paintIndex. Not once the seller has committed,
  // we will check the seller inventory again in the cron-job, and if the item is not there
  // anymore, then we need to track the buyer inventory and check if the similar items count.
  // All this flow should be probably divided into three functions, one per status change.
  // There is 3 status changes in this flow.

  // when the buyer purchases the item, we need to check the seller inventory again,
  // if the item is still there, we need to check the buyer inventory to see if similar items
  // are there, if they are, we need to store that count.

  // at this stage we need to interval the seller inventory to keep track when the item
  // is not in the inventory anymore, when that happens, we need to check the buyer inventory
  // and validate the similar items count, if it's one more in similar items count, we need
  // to release the item the funds to the seller.

  public async trackItem(
    originId: string,
    destinationId: string,
    assetId: string,
    _floatValue: number,
    _paintSeed: number,
    _paintIndex: number,
  ): Promise<void> {
    const originInventory = await this._getInventory(originId);

    const item = originInventory.find(
      (item: { assetid: string }) => item.assetid === assetId,
    );

    if (item) {
      const similarItemsCount = await this._getSimilarItemsCount(
        destinationId,
        item.market_hash_name,
        _floatValue,
        _paintSeed,
        _paintIndex,
      );

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
        similarItemsCount,
      });

      await this.trackedItemsRepository.save(trackedItem);

      // Add the tracked item to the in-memory list
      this.trackedItems.push(trackedItem);

      this.logger.log(
        `Start tracking item ${assetId} from ${originId} to ${destinationId}`,
      );
    } else {
      console.warn(
        `No item with assetId ${assetId} found in the steam inventory, no tracking stored.`,
      );
      // TODO: delist the item from the csx-market and refund buyer
    }
  }

  // To check tracked items periodically
  isCheckingItems = false;
  private async _checkTrackedItems(): Promise<void> {
    if (this.trackedItems.length === 0) {
      this.logger.log('No tracked items.');
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
          `checking tracked item ${trackedItem.id} ${trackedItem.originId} ${trackedItem.destinationId} ${trackedItem.market_hash_name} ${trackedItem.details.floatValue} ${trackedItem.details.paintSeed} ${trackedItem.details.paintIndex}`,
        );

        const similarItemsInTargetInventory = await this._getSimilarItemsCount(
          trackedItem.destinationId,
          trackedItem.market_hash_name,
          trackedItem.details.floatValue,
          trackedItem.details.paintSeed,
          trackedItem.details.paintIndex,
        );

        if (similarItemsInTargetInventory > trackedItem.similarItemsCount) {
          this.logger.log(
            `Item ${trackedItem.id} has moved from ${trackedItem.originId} to ${trackedItem.destinationId}.`,
          );

          // Release the item from the csx-market

          // // Remove the item from the in-memory list
          // this.trackedItems = this.trackedItems.filter(
          //   (item) => item.id !== trackedItem.id,
          // );

          // // Remove the item from the database
          // await this.trackedItemsRepository.remove(trackedItem);
        }
      } catch (error) {
        this.logger.error(`Error processing tracked item with ID: ${trackedItem.id}`, error.message);
      }
    }
    this.logger.warn('Done checking items.');
    this.isCheckingItems = false;
  }

  // To get the inventory of a user
  // Code 403: Private inventory

  private async _getInventory(_steamId64: string): Promise<any> {
    try {
      const MAX_RETRIES = 3; // Maximum retry count
      const RETRY_DELAY_MS = 1000; // Delay between retries in milliseconds

      const { data } = await firstValueFrom(
        this.httpService
          .get<InventoryResponse>(
            `https://api.steamapis.com/steam/inventory/${_steamId64}/730/2?api_key=${this.config.get<string>(
              'STEAMAPIS_KEY',
            )}`,
          )
          .pipe(
            //retryWithDelayAndLimit(RETRY_DELAY_MS, MAX_RETRIES),
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              // If the error is not catched, turn of the isCheckingItems flag
              // this.logger.warn('Setting isCheckingItems to false.');
              // this.isCheckingItems = false;
              throw 'An error happened in _getInventory!';
            }),
          ),
      );

      //console.log('full url', `https://api.steamapis.com/steam/inventory/${_steamId64}/730/2?api_key=${this.config.get<string>('STEAMAPIS_KEY')}`);

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
      return merged;
    } catch (error) {
      console.log('ERRRRR!!!!', error);
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
    const targetInventory = await this._getInventory(destinationId);
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
    if (this.isCheckingItems)
      return this.logger.warn('Already checking items.');
    await this._checkTrackedItems();
  }
}

type targetItem = {
  market_hash_name: string;
  floatValue: number;
  paintSeed: number;
  paintIndex: number;
};

