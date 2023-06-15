/* eslint-disable prettier/prettier */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class TrackService {
  private readonly logger = new Logger(TrackService.name);

  // We will store the tracked items here
  private trackedItems: Map<string, Item> = new Map();

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  // To start tracking an item
  async trackItem(_steamId64: string, assetId: string): Promise<void> {
    const inventory = await this.getInventory(_steamId64);
    const item = inventory.find((item) => item.assetid === assetId);

    if (item) {
      this.trackedItems.set(assetId, {
        floatValue: item.floatvalue,
        paintSeed: item.paintseed,
        paintIndex: item.paintindex,
        originId: _steamId64,
      });
      this.logger.log(`Start tracking item ${assetId}`);
    } else {
      throw new Error(
        `No item with assetId ${assetId} found in the inventory.`,
      );
    }
  }

  // To check tracked items periodically
  async checkTrackedItems(targetId: string) {
    const targetInventory = await this.getInventory(targetId);
    this.trackedItems.forEach((item, assetId) => {
      const itemInOriginInventory = targetInventory.find(
        (targetItem) =>
          targetItem.floatvalue === item.floatValue &&
          targetItem.paintseed === item.paintSeed &&
          targetItem.paintindex === item.paintIndex,
      );

      if (itemInOriginInventory) {
        this.logger.log(`Item ${assetId} has moved to the target inventory.`);
        this.trackedItems.delete(assetId);
      }
    });
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
}

type Item = {
  floatValue: number;
  paintSeed: number;
  paintIndex: number;
  originId: string;
};
