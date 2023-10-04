/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { TrackService } from './track.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrackedItem } from '../database/entities/tracked-items/tracked-items.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FloatApiService } from '../float-api/float-api.service';
describe('TrackService', () => {
  let service: TrackService;
  const isResetAllMocks = false;
  const mockRepository = {
    find: jest.fn().mockReturnValue([]),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const mockHttpService = {
    get: jest.fn(),
  };
  const mockFloatService = {
    getFloat: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackService,
        {
          provide: getRepositoryToken(TrackedItem),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: FloatApiService,
          useValue: mockFloatService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService, // Add this mock
        },
      ],
    }).compile();

    service = module.get<TrackService>(TrackService);
    if(isResetAllMocks) {
      jest.resetAllMocks();
      service['trackedItems'] = [];
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('_loadTrackedItems', () => {
    it('should load items from the repository', async () => {
      mockRepository.find.mockResolvedValueOnce([
        {
          id: 1,
          originId: 'test-origin-1',
          destinationId: 'test-dest-1',
          assetId: 'test-name-1',
          market_hash_name: 'test-name-1',
          details: {
            floatValue: 0.01,
            paintSeed: 100,
            paintIndex: 10,
          },
          similarItemsCount: 0,
        },
        {
          id: 2,
          originId: 'test-origin-2',
          destinationId: 'test-dest-2',
          assetId: 'test-name-2',
          market_hash_name: 'test-name-2',
          details: {
            floatValue: 0.02,
            paintSeed: 200,
            paintIndex: 20,
          },
          similarItemsCount: 0,
        },
      ]);
      await service['_loadTrackedItems']();
      expect(service['trackedItems']).toHaveLength(2);
      expect(service['cronEnabled']).toBeTruthy();
    });
  });

  describe('trackItem', () => {

    it('should not add item to track if the item does not exist', async () => {
      // Mock the expected inventory response

      const mockOriginInventory: InventoryResponse[] = [
        {
          assets: [
            {
              appid: 730,
              contextid: "2",
              assetid: "test-name-1",
              classid: "test-class-1",
              instanceid: "test-instance-1",
              amount: "1"
            },
            {
              appid: 730,
              contextid: "2",
              assetid: "test-name-2",
              classid: "test-class-2",
              instanceid: "test-instance-2",
              amount: "2"
            }
          ],
          descriptions: [
            {
              appid: 730,
              classid: "test-class-1",
              instanceid: "test-instance-1",
              currency: 0,
              background_color: "#ffffff",
              icon_url: "http://example.com/icon.png",
              icon_url_large: "http://example.com/icon_large.png",
              descriptions: [
                {
                  type: "TypeA",
                  value: "ValueA",
                  color: "#000000"
                }
              ],
              tradable: 1,
              actions: [
                {
                  link: "http://example.com/link",
                  name: "Inspect in Game..."
                }
              ],
              name: "NameA",
              name_color: "#ff0000",
              type: "TypeA",
              market_name: "MarketNameA",
              market_hash_name: "test-name-1",
              market_actions: [
                {
                  link: "http://example.com/market_link",
                  name: "MarketActionName"
                }
              ],
              commodity: 1,
              market_tradable_restriction: 0,
              marketable: 1,
              tags: [
                {
                  category: "CategoryA",
                  internal_name: "InternalNameA",
                  localized_category_name: "LocalizedCategoryNameA",
                  localized_tag_name: "LocalizedTagNameA",
                  color: "#00ff00"
                }
              ]
            },
            {
              appid: 730,
              classid: "test-class-2",
              instanceid: "test-instance-2",
              currency: 0,
              background_color: "#ffffff",
              icon_url: "http://example.com/icon2.png",
              icon_url_large: "http://example.com/icon_large2.png",
              descriptions: [
                {
                type: "TypeB",
                value: "ValueB",
                color: "#ff00ff"
                }
              ],
              tradable: 1,
              actions: [
                {
                link: "http://example.com/link2",
                name: "Inspect in Game..."
                }
              ],
              name: "NameB",
              name_color: "#00ff00",
              type: "TypeB",
              market_name: "MarketNameB",
              market_hash_name: "test-name-2",
              market_actions: [
                {
                  link: "http://example.com/market_link2",
                  name: "MarketActionNameB"
                }
              ],
              commodity: 1,
              market_tradable_restriction: 0,
              marketable: 1,
              tags: [
                {
                  category: "CategoryB",
                  internal_name: "InternalNameB",
                  localized_category_name: "LocalizedCategoryNameB",
                  localized_tag_name: "LocalizedTagNameB",
                  color: "#ff00ff"
                }
              ]
            }
          ],
          total_inventory_count: 2,
          success: 1,
          rwgrsn: -2
        }
      ];

      // Mock the STEAMAPIS_KEY
      mockConfigService.get.mockReturnValue('MOCK_API_KEY');

      // Mock the expected inventory response
      mockHttpService.get.mockReturnValue(of({ data: mockOriginInventory[0] }));
 
      // Wait for the async initialization if isResetAllMocks is true 
      //await service['_loadTrackedItems']();
 
      await service.trackItem('0x00', '76561198185748194', '76561198249128626', 'test-name-404', 0.01, 100, 10);

      expect(service['trackedItems']).toHaveLength(0);
    });

    it('should add item to track if the item exists', async () => {
      // Mock the expected inventory response

      const mockOriginInventory: InventoryResponse[] = [
        {
          assets: [
            {
              appid: 730,
              contextid: "2",
              assetid: "test-name-1",
              classid: "test-class-1",
              instanceid: "test-instance-1",
              amount: "1"
            },
            {
              appid: 730,
              contextid: "2",
              assetid: "test-name-2",
              classid: "test-class-2",
              instanceid: "test-instance-2",
              amount: "2"
            }
          ],
          descriptions: [
            {
              appid: 730,
              classid: "test-class-1",
              instanceid: "test-instance-1",
              currency: 0,
              background_color: "#ffffff",
              icon_url: "http://example.com/icon.png",
              icon_url_large: "http://example.com/icon_large.png",
              descriptions: [
                {
                  type: "TypeA",
                  value: "ValueA",
                  color: "#000000"
                }
              ],
              tradable: 1,
              actions: [
                {
                  link: "http://example.com/link",
                  name: "Inspect in Game..."
                }
              ],
              name: "NameA",
              name_color: "#ff0000",
              type: "TypeA",
              market_name: "MarketNameA",
              market_hash_name: "test-name-1",
              market_actions: [
                {
                  link: "http://example.com/market_link",
                  name: "MarketActionName"
                }
              ],
              commodity: 1,
              market_tradable_restriction: 0,
              marketable: 1,
              tags: [
                {
                  category: "CategoryA",
                  internal_name: "InternalNameA",
                  localized_category_name: "LocalizedCategoryNameA",
                  localized_tag_name: "LocalizedTagNameA",
                  color: "#00ff00"
                }
              ]
            },
            {
              appid: 730,
              classid: "test-class-2",
              instanceid: "test-instance-2",
              currency: 0,
              background_color: "#ffffff",
              icon_url: "http://example.com/icon2.png",
              icon_url_large: "http://example.com/icon_large2.png",
              descriptions: [
                {
                type: "TypeB",
                value: "ValueB",
                color: "#ff00ff"
                }
              ],
              tradable: 1,
              actions: [
                {
                link: "http://example.com/link2",
                name: "Inspect in Game..."
                }
              ],
              name: "NameB",
              name_color: "#00ff00",
              type: "TypeB",
              market_name: "MarketNameB",
              market_hash_name: "test-name-2",
              market_actions: [
                {
                  link: "http://example.com/market_link2",
                  name: "MarketActionNameB"
                }
              ],
              commodity: 1,
              market_tradable_restriction: 0,
              marketable: 1,
              tags: [
                {
                  category: "CategoryB",
                  internal_name: "InternalNameB",
                  localized_category_name: "LocalizedCategoryNameB",
                  localized_tag_name: "LocalizedTagNameB",
                  color: "#ff00ff"
                }
              ]
            }
          ],
          total_inventory_count: 2,
          success: 1,
          rwgrsn: -2
        }
      ];

      // Mock the STEAMAPIS_KEY
      mockConfigService.get.mockReturnValue('MOCK_API_KEY');

      // Mock the expected inventory response
      mockHttpService.get.mockReturnValue(of({ data: mockOriginInventory[0] }));

      // Wait for the async initialization if isResetAllMocks is true 
      //await service['_loadTrackedItems']();

      await service.trackItem('0x00', '76561198185748194', '76561198249128626', 'test-name-1', 0.01, 100, 10);
        
      // Assert that the item was added to the trackedItems array
      expect(service['trackedItems']).toHaveLength(1);
    });
  });

  // Similarly, add tests for other methods such as _checkTrackedItems and handleCron.
  // Make sure to mock the required methods and set expectations.
});
