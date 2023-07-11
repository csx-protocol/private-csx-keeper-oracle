/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackedItem } from '../database/entities/tracked-items/tracked-items.entity';
import { AxiosError } from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);54
  private trackedItems: TrackedItem[];
  private cronEnabled = false;
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(TrackedItem)
    private trackedItemsRepository: Repository<TrackedItem>,
  ) {
    this._loadTrackedItems(); // Do this after web3 has been initialized up to the latest block.
  }

  private async _loadTrackedItems(): Promise<void> {
    this.trackedItems = await this.trackedItemsRepository.find();
    this.cronEnabled = true;
  }

  // To start tracking an item

  // Pull similar items based only on name, then take all their assetids and pull their actions.link url, construct url and then pull float details.

  // or nah, just look if destination inventory has an item with the same name, if so, check them all for float details, and if they match float details with sold item, then add to similarItemsCount.
  // then on period check, dont remember count, just check if item found with same market hash name, if so, check its float details and compare. if match, trade success.
  // float details = floatvalue, paintseed, paintindex
   async trackItem(originId: string, destinationId: string, assetId: string, _floatValue: number, _paintSeed: number, _paintIndex: number): Promise<void> {
    const originInventory = await this.getInventory(originId);
    const item = originInventory.find((item: { assetid: string; }) => item.assetid === assetId);

    if (item) {
      const targetInventory = await this.getInventory(destinationId);
      
      const similarItemsCount = targetInventory.filter((targetItem: targetItem) =>
        targetItem.market_hash_name === item.market_hash_name &&
        targetItem.floatValue === _floatValue &&
        targetItem.paintSeed === _paintSeed &&
        targetItem.paintIndex === _paintIndex
      ).length;

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

      this.logger.log(`Start tracking item ${assetId} from ${originId} to ${destinationId}`);
    } else {
      console.warn(`No item with assetId ${assetId} found in the inventory, no tracking stored.`);
      // TODO: delist the item from the csx-market and refund buyer
    }
  }

  // To check tracked items periodically
  async checkTrackedItems(): Promise<void> {
    if (this.trackedItems.length === 0) {
        this.logger.log('No tracked items.');
        return;
    }

    this.logger.log(`Checking ${this.trackedItems.length} tracked items.`);
    
    for (const trackedItem of this.trackedItems) {
      const targetInventory = await this.getInventory(trackedItem.destinationId);
      
      const similarItemsInTargetInventory = targetInventory.filter((targetItem: targetItem) =>
        targetItem.market_hash_name === trackedItem.market_hash_name &&
        targetItem.floatValue === trackedItem.details.floatValue &&
        targetItem.paintSeed === trackedItem.details.paintSeed &&
        targetItem.paintIndex === trackedItem.details.paintIndex
      );

      if (similarItemsInTargetInventory.length > trackedItem.similarItemsCount) {
        this.logger.log(`Item ${trackedItem.assetId} has moved from ${trackedItem.originId} to ${trackedItem.destinationId}.`);
        
        // Remove the item from the in-memory list
        this.trackedItems = this.trackedItems.filter(item => item.id !== trackedItem.id);

        // Remove the item from the database
        await this.trackedItemsRepository.remove(trackedItem);
      }
    }
  }

  // To get the inventory of a user
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

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    if (!this.cronEnabled) return this.logger.warn('Cron is disabled.');
    await this.checkTrackedItems();
  }
}

type targetItem = {
    market_hash_name: string;
    floatValue: number;
    paintSeed: number;
    paintIndex: number;
};
  