import { Test, TestingModule } from '@nestjs/testing';
import { PrimaryDatabaseService } from './database.service';
import { Repository } from 'typeorm';
import { ContractEntity } from '../../entities/primary/contract-entity/contract.entity';
import { StatusHistoryEntity } from '../../entities/primary/status-history/status-history.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('DatabaseService', () => {
  let service: PrimaryDatabaseService;
  let contractEntityRepo: jest.Mocked<Repository<ContractEntity>>;
  let statusHistoryEntityRepo: jest.Mocked<Repository<StatusHistoryEntity>>;

  // This function mocks the repository with default functions
  const mockRepository = jest.fn(() => ({
    metadata: {
      columns: [],
      relations: [],
    },
    findOne: jest.fn(),
    save: jest.fn(),
    // ... any other methods used in the service
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrimaryDatabaseService,
        {
          provide: getRepositoryToken(ContractEntity),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(StatusHistoryEntity),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<PrimaryDatabaseService>(PrimaryDatabaseService);
    contractEntityRepo = module.get(getRepositoryToken(ContractEntity));
    statusHistoryEntityRepo = module.get(
      getRepositoryToken(StatusHistoryEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more specific tests below
  describe('createOrReturn', () => {
    it('should return existing data if found', async () => {
      contractEntityRepo.findOne.mockResolvedValue(new ContractEntity());
      const result = await service.createOrReturn(new ContractEntity());
      expect(result.saved).toBe(false);
      expect(result.data).toBeDefined();
    });

    // ... more tests for other cases
  });

  // ... Add more tests for other methods of the service
});
