/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  catchError,
  firstValueFrom,
  expand,
  delay,
  take,
  EMPTY,
  Observable,
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
  private trackedItems: TrackedItem[];
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
        `No item with assetId ${assetId} found in the inventory, no tracking stored.`,
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

    for (const trackedItem of this.trackedItems) {

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
    }
    this.isCheckingItems = false;
  }

  // To get the inventory of a user
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
            retryWithDelayAndLimit(RETRY_DELAY_MS, MAX_RETRIES),
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              throw 'An error happened!';
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
        const fetchFloat = await this.floatService.getFloat(inspectLink);
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

// A custom operator for retries
function retryWithDelayAndLimit<T>(delayMs: number, maxRetries: number) {
  return (source: Observable<T>) => {
    return source.pipe(
      expand((val: T, i: number) => {
        if (i < maxRetries) {
          return source.pipe(delay(delayMs));
        } else {
          return EMPTY;
        }
      }),
      take(maxRetries + 1),
      catchError((error: any) => {
        throw error;
      }),
    );
  };
}
