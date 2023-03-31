import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, of } from 'rxjs';

const market_hash_name = 'P250 | Sand Dune (Field-Tested)';
const bankOne = '76561198249128626';
const bankTwo = '76561198261164948';

@Injectable()
export class ItemTrackerService {
  private readonly logger = new Logger(ItemTrackerService.name);
  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {
    //this.trackItemFromTo(market_hash_name, bankOne, bankTwo);
    const res = this._tradeUrlToSteamID64(
      'https://steamcommunity.com/tradeoffer/new/?partner=225482466&token=EP2Wgs2R',
    );
    console.log('??', res);
  }

  /**
   * enum TradeStatus {
        Pending,
        SellerCancelled,
        Committed,
        Accepted,
        Completed,
        Disputed,
        Resolved,
        Clawbacked
    }
   */

  /**
   * ::
   *    Keepers node
   * ::
   *     Event from new contract creation then start listen to new contract Event status change from pending to committed, when that happens, run:
   *        Check if item is in seller inv (get data from event), or forfeit trade.
   *        () Listen to BuyerCommitted event then:
   *        Get TradeLink URLs & assetID from Contract
   *        Get Buyer & seller inventories.
   *        Check if assetId is tradable in seller inventory.
   *         -No: capitulate or notify keepers about order =>
   *                Refunding buyer(if buyer doesnt have market_hash_name item as tradable:0)
   *                    else
   *                Do nothing? (log internal it cant notify!!)
   *         -Yes: continue
   *
   *        Save in local database, interval started (so if node crashes, it can pick up where it left-off in onStart.) Or if can pull from chain past events and run check if committed up to latest block
   *        Interval() => {
   *            Check if assetId is gone from seller inv &&,
   *            Check if seller has new item with market_hash_name which is tradable:0,
   *            Verify dates match.
   *            If all true: release coins to seller & stop interval.
   *        }
   * */

  async onBuyerCommitted(
    _contractAddress: string,
    _assetId: string,
    _sellerTradeUrl: string,
    _buyerTradeUrl: string,
    _market_hash_name: string, // check that the assetId found has this hash_name.
  ): Promise<boolean> {
    // Take Snapshot Buyer & seller inventories, store in DB for trade:
    const _sellerSteamID64 = this._tradeUrlToSteamID64(_sellerTradeUrl);
    const _buyerSteamID64 = this._tradeUrlToSteamID64(_buyerTradeUrl);
    const _seller = await this.getInventory(_sellerSteamID64);
    const _buyer = await this.getInventory(_buyerSteamID64);
    // Save _ buyer n seller
    // Check if item is in seller inv (get data from event), or forfeit trade:
    const itemIsInSellerInv = this._isItemInLocalInventory(
      _seller.AllInventoryItems,
      _assetId,
    );
    // Check here so that an interval has not already started! if it has! dont punish/forfiet !itemIsInSellerInv
    if (!itemIsInSellerInv) {
      await this._forfeitTrade(_contractAddress); // Refunding buyer(if buyer doesnt have market_hash_name item as tradable:0)
    } else {
      // Store state in db that interval hasStarted here so it wont forfeitTrade if system restarts but what if system is late??
      let state = 0;
      const intervalId = setInterval(async () => {
        switch (state) {
          case 0:
            if (!itemIsInSellerInv) {
              const isItemInBuyerInvAsNonTradable /*AndSameFloatVal*/ =
                this._isItemInLocalInventory(
                  _buyer.AllInventoryItems,
                  undefined,
                  _market_hash_name,
                ); // add with Same Float Value!
              if (!isItemInBuyerInvAsNonTradable)
                // Refunding buyer(if buyer doesnt have market_hash_name item as tradable:0 with same floatvalue)
                // Check if any part tries to obfusecate!
                await this._forfeitTrade(_contractAddress);
            } else {
              // Store assetId's market_hash_name's buyer count in DB. // Not Needed when checking float value?
              state = 1;
            }
            break;
          case 1:
            //....
            const _interSeller = await this.getInventory(_sellerSteamID64);
            const itemIsInInterSellerInv = this._isItemInLocalInventory(
              _interSeller.AllInventoryItems, //
              _assetId,
            );
            if (!itemIsInInterSellerInv) {
              const _interBuyer = await this.getInventory(_buyerSteamID64);
              // Since not checking assetId, check in DB the count of that markethashname.
              // 'itemIsInBuyerInvAndNonTradable' WithSameFloatValue?
              const itemIsInBuyerInvAndNonTradable =
                this._isItemInLocalInventory(
                  _interBuyer.AllInventoryItems,
                  undefined,
                  _market_hash_name,
                );
              if (itemIsInBuyerInvAndNonTradable) {
                await this._completeTrade(_contractAddress);
              }
            }
            break;
          default:
            break;
        }

        // Check if assetId is gone from seller inv &&,
        // Check if seller has new item with market_hash_name which is tradable:0,
        // Verify dates match.
        // If all true: release coins to seller & stop interval.
        // |-> clearInterval(intervalId);
      }, 5000);
    }

    return false;
  }
  private async _completeTrade(_contractAddress: string) {
    throw new Error('_completeTrade not implemented.');
  }

  private async _forfeitTrade(_contractAddress: string) {
    throw new Error('_forfeitTrade not implemented.');
  }

  private _isItemInLocalInventory(
    _user: User,
    _assetId?: string,
    _market_hash_name?: string,
  ): boolean {
    if (!_assetId && !_market_hash_name) {
      throw new Error('Asset Id or Market Hash Name is required.');
    }

    const filteredInventory = _user.AllInventoryItems.filter((item) => {
      if (_assetId != undefined) {
        return item.assetid === _assetId;
      }
      if (_market_hash_name) {
        return (
          item.market_hash_name === _market_hash_name && item.tradable === 0
        );
      }
    });

    return filteredInventory.length > 0;
  }

  private _tradeUrlToSteamID64(_tradeUrl: string): string {
    const url = _tradeUrl;
    const params = new URLSearchParams(new URL(url).search);
    const partnerId = params.get('partner');
    //
    const partnerIdInt = parseInt(partnerId);
    return `7656119${partnerIdInt + 7960265728}`;
  }

  private _steamId64ToSteamID3(steamId64: string): string {
    const steamIdInt = parseInt(steamId64.substring(3));
    // const steamID3 = '[U:1:' + (steamIdInt - 61197960265728) + ']';
    const steamID3 = (steamIdInt - 61197960265728).toString();
    return steamID3;
  }

  // Run this againgst csgofloat api to get float value of new item at buyer to identify via contract that is has same float val, then we good to release coins.
  private _generateInspectLink(_steamId64: string, _assetId: string): string {
    const _steamId3 = this._steamId64ToSteamID3(_steamId64);
    const baseUrl =
      'steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S';
    const owner_steamid = _steamId3;
    const assetid = _assetId;
    const url =
      baseUrl + owner_steamid + 'A' + assetid + 'D14756728646156339180';
    return url; // steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S123456789A987654321D14756728646156339180
  }

  private findAllWithSameMarketHashName(
    inventory: InventoryResponseMerged[],
    _market_hash_name: string,
  ): InventoryResponseMerged[] {
    return inventory.filter(
      (item) => item.market_hash_name === _market_hash_name,
    );
  }

  async trackItemFromTo(
    market_hash_name: string,
    sellerSteamId64: string,
    buyerSteamId64: string,
  ) {
    /**
     * Seller
     */
    const seller: User = {
      hasTrackedItem: false,
      fetchedTime: '',
      AllInventoryItems: undefined,
      trackedItems: undefined,
      assetIds: [],
    };
    seller.AllInventoryItems = await this.getInventory(sellerSteamId64);
    console.log(seller.AllInventoryItems.length);

    const itemsWithCountMoreThanOne = (
      inventory: InventoryResponseMerged[],
    ) => {
      return inventory.find((item) => parseInt(item.amount) > 1);
    };

    const findAllWithSameMarketHashName = (
      inventory: InventoryResponseMerged[],
      _market_hash_name: string,
    ) => {
      return inventory.filter(
        (item) => item.market_hash_name === _market_hash_name,
      );
    };
    // console.log(
    //   'itemsWithCountMoreThanOne',
    //   itemsWithCountMoreThanOne(seller.AllInventoryItems),
    //   'findAllWithSameMarketName',
    //   findAllWithSameMarketHashName(seller.AllInventoryItems, market_hash_name),
    // );
    const gg = findAllWithSameMarketHashName(
      seller.AllInventoryItems,
      market_hash_name,
    );

    gg.forEach(async (element) => {
      //console.log(element.assetid);
      //const url = this._generateInspectLink(sellerSteamId64, element.assetid);
      //const results = await this.getItemInfo(url).toPromise();
      //console.log(results.data);
      // {
      //   iteminfo: {
      //     origin: 24,
      //     quality: 4,
      //     rarity: 1,
      //     a: '4256788791',
      //     d: '5522225450328804168',
      //     paintseed: 74,
      //     defindex: 36,
      //     paintindex: 99,
      //     stickers: [],
      //     floatid: '4256788791',
      //     floatvalue: 0.2589457333087921,
      //     s: '76561198249128626',
      //     m: '0',
      //     imageurl: 'http://media.steampowered.com/apps/730/icons/econ/default_generated/weapon_p250_so_sand_light_large.c77b762093b4786e0c070317e6a2121c2e7b4c86.png',
      //     min: 0.06,
      //     max: 0.8,
      //     weapon_type: 'P250',
      //     item_name: 'Sand Dune',
      //     rarity_name: 'Consumer Grade',
      //     quality_name: 'Unique',
      //     origin_name: 'Level Up Reward',
      //     wear_name: 'Field-Tested',
      //     full_item_name: 'P250 | Sand Dune (Field-Tested)'
      //   }
      // }
    });

    // seller.trackedItems = [...seller.AllInventoryItems.descriptions].filter(
    //   (item) => item.market_hash_name === market_hash_name && item.tradable,
    // );
    // seller.assetIds = [...seller.trackedItems].map((item) => item.assetId);
    // seller.fetchedTime = new Date().toLocaleString();

    /**
     * Buyer
     */
    const buyer: User = {
      hasTrackedItem: false,
      fetchedTime: '',
      AllInventoryItems: undefined,
      trackedItems: undefined,
      assetIds: [],
    };
    buyer.AllInventoryItems = await this.getInventory(buyerSteamId64);

    // console.log(
    //   'itemsWithCountMoreThanOne',
    //   itemsWithCountMoreThanOne(buyer.AllInventoryItems),
    //   'findAllWithSameMarketName',
    //   findAllWithSameMarketHashName(buyer.AllInventoryItems, market_hash_name),
    // );
    // buyer.trackedItems = [...buyer.AllInventoryItems.descriptions].filter(
    //   (item) => item.market_hash_name === market_hash_name,
    // );
    // buyer.assetIds = [...buyer.trackedItems].map((item) => item.assetId);
    // buyer.fetchedTime = new Date().toLocaleString();

    //console.log(seller);

    /**
     *
     */
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

  //Web3 Check contract if new sales are in need for check item sent to buyer...
  //Create listeners for all new available / intervals.
  TEMP_API = 'https://api.csgofloat.com/?url=';
  getItemInfo(inspectLink: string): any {
    return this.httpService.get<any>(this.TEMP_API + inspectLink).pipe(
      catchError((error) => {
        if (error.status === 500) {
          return of(ErrorMessages[ErrorCodes.InternalError]);
        } else {
          console.log('ERRRRRR', error);
          if (error.error.code as number) {
            const number: number = error.error.code;
            return of(ErrorMessages[number as ErrorCodes]);
          }
          return of(ErrorMessages[ErrorCodes.InternalError]);
        }
      }),
    );
  }
}

enum ErrorCodes {
  ImproperParameterStructure = 1,
  InvalidInspectLinkStructure = 2,
  PendingRequestsExceeded = 3,
  ValveServersTimeout = 4,
  ValveServersOffline = 5,
  InternalError = 6,
  ImproperBodyFormat = 7,
  BadSecret = 8,
}

const ErrorMessages = {
  [ErrorCodes.ImproperParameterStructure]: 'Improper parameter structure',
  [ErrorCodes.InvalidInspectLinkStructure]: 'Invalid inspect link structure',
  [ErrorCodes.PendingRequestsExceeded]:
    'You may only have X pending request(s) at a time',
  [ErrorCodes.ValveServersTimeout]: "Valve's servers didn't reply in time",
  [ErrorCodes.ValveServersOffline]:
    "Valve's servers appear to be offline, please try again later!",
  [ErrorCodes.InternalError]:
    'Something went wrong on our end, please try again',
  [ErrorCodes.ImproperBodyFormat]: 'Improper body format',
  [ErrorCodes.BadSecret]: 'Bad Secret',
};

interface User {
  hasTrackedItem: boolean;
  fetchedTime: string;
  AllInventoryItems: InventoryResponseMerged[];
  assetIds: string[];
  [trackedItems: string]: any;
}

interface InventoryResponse {
  assets: Assets[];
  descriptions: Descriptions[];
  total_inventory_count: number;
  success: number;
  rwgrsn: number;
}

interface InventoryResponseMerged {
  actions: any[];
  tags: any[];
  descriptions: any[];
  tradable: number;
  market_hash_name: unknown;
  appid: string;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  description: any[];
}

interface Assets {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

interface Descriptions {
  appid: number;
  classid: string;
  instanceid: string;
  currency: number;
  background_color: string;
  icon_url: string;
  icon_url_large: string;
  descriptions: {
    type: string;
    value: string;
    color?: string;
  }[];
  tradable: number;
  actions: {
    link: string;
    name: string;
  }[];
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  market_actions: {
    link: string;
    name: string;
  }[];
  commodity: number;
  market_tradable_restriction: number;
  marketable: number;
  tags: {
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }[];
}
