import { Test, TestingModule } from '@nestjs/testing';
import { ItemTrackerService } from './item-tracker.service';

describe('ItemTrackerService', () => {
  let service: ItemTrackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemTrackerService],
    }).compile();

    service = module.get<ItemTrackerService>(ItemTrackerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
