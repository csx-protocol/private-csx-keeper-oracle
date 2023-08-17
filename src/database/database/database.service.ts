import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ContractEntity } from '../entities/contract-entity/contract.entity';
import { StatusHistoryEntity } from '../entities/status-history/status-history.entity';
import { TradeStatus } from './interface';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(
    @InjectRepository(ContractEntity)
    private readonly blockDataRepository: Repository<ContractEntity>,
    @InjectRepository(StatusHistoryEntity)
    private readonly statusHistoryRepository: Repository<StatusHistoryEntity>,
  ) {}

  // async findAll(): Promise<ContractEntity[]> {
  //   return await this.blockDataRepository.find();
  // }

  async createOrReturn(
    blockData: ContractEntity,
  ): Promise<{ saved: boolean; data?: ContractEntity }> {
    try {
      const findOneOptions: FindOneOptions<ContractEntity> = {
        where: {
          contractAddress: blockData.contractAddress,
        },
      };

      const existingData = await this.blockDataRepository.findOne(
        findOneOptions,
      );
      if (existingData) {
        return { saved: false, data: existingData };
      }

      const savedData = await this.blockDataRepository.save(blockData);

      blockData.statusHistory[0].contract = savedData;

      await this.statusHistoryRepository.save(blockData.statusHistory);

      return { saved: true, data: savedData };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // find by contractAddress

  async findByContractAddress(
    contractAddress: string,
  ): Promise<ContractEntity> {
    try {
      const findOneOptions: FindOneOptions<ContractEntity> = {
        where: {
          contractAddress: contractAddress,
        },
      };

      const existingData = await this.blockDataRepository.findOne(
        findOneOptions,
      );

      return existingData;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async fetchLastKnownBlock(): Promise<number> {
    try {
      const lastData = await this.blockDataRepository
        .createQueryBuilder('contract')
        .orderBy('contract.lastBlockHeight', 'DESC')
        .getOne();

      return lastData.lastBlockHeight;
    } catch (error) {
      console.warn(error, 'will continue from block 0:');
      return 0;
    }
  }

  // async createOrUpdate(blockData: ContractEntity): Promise<ContractEntity> {
  //   try {
  //     const existingData = await this.blockDataRepository.findOne({
  //       where: { contractAddress: blockData.contractAddress },
  //     });

  //     if (existingData) {
  //       existingData.lastBlockHeight = blockData.lastBlockHeight;
  //       return await this.blockDataRepository.save(existingData);
  //     } else {
  //       return await this.blockDataRepository.save(blockData);
  //     }
  //   } catch (error)  {
  //     console.error(error);
  //     return null;
  //   }
  // }

  async updateStatus(
    _contractAddress: string,
    _status: string,
    _lastBlockHeight: number,
    _extra?: ExtraDataToUpdate,
  ): Promise<{ saved: boolean }> {
    try {
      // Updating status on contract_entity
      const updateOption: ExtraDataToUpdate = {
        status: _status,
        lastBlockHeight: _lastBlockHeight,
      };

      //console.log('update option before?', updateOption);

      if (_extra) {
        if (_extra.buyerTradeUrl) {
          updateOption.buyerTradeUrl = _extra.buyerTradeUrl;
        }
        if (_extra.isDisputed == true || _extra.isDisputed == false) {
          updateOption.isDisputed = _extra.isDisputed;
        }
        if (_extra.disputeReason) {
          updateOption.disputeReason = _extra.disputeReason;
        }
      }

      //console.log('update option after?', updateOption);

      const updateResult = await this.blockDataRepository.update(
        { contractAddress: _contractAddress },
        updateOption,
      );

      // Check if the update was successful
      if (updateResult.affected === 0) {
        this.logger.error(
          `failed to update contract status, contractAddress: ${_contractAddress} || status: ${_status} || lastBlockHeight: ${_lastBlockHeight}`,
        );
        return { saved: false };
      }

      // Get the updated contract_entity
      const contract = await this.blockDataRepository.findOne({
        where: { contractAddress: _contractAddress },
      });

      // Check if the history for this status change already exists
      const existingHistory = await this.statusHistoryRepository.findOne({
        where: { contract, status: _status, blockHeight: _lastBlockHeight },
      });

      if (existingHistory) {
        return { saved: false };
      }

      // Save the status change history
      await this.statusHistoryRepository.save({
        contract,
        status: _status,
        blockHeight: _lastBlockHeight,
      });

      return { saved: true };
    } catch (error) {
      this.logger.error(
        `[FAILED] (updateStatus): contractAddress:${_contractAddress} & status:${_status} & lastBlockHeight:${_lastBlockHeight}`,
        error,
      );
      throw error;
    }
  }

  async isStatusHigherThanKnown(
    event: any,
  ): Promise<{ higher: boolean; currentStatus: string; newStatus: string }> {
    try {
      if (event.newStatus == TradeStatus.ForSale) {
        return {
          higher: true,
          currentStatus: '0',
          newStatus: TradeStatus.ForSale,
        };
      }

      const contract = await this.blockDataRepository.findOne({
        where: { contractAddress: event.contractAddress },
      });

      if (parseInt(contract.status) < parseInt(event.newStatus)) {
        return {
          higher: true,
          currentStatus: contract.status,
          newStatus: event.newStatus,
        };
      } else {
        return {
          higher: false,
          currentStatus: contract.status,
          newStatus: event.newStatus,
        };
      }
    } catch (error) {
      this.logger.error(
        `[FAILED] (isStatusHigherThan): contractAddress:${event.contractAddress} & status:${event.newStatus}`,
        error,
      );
      return {
        higher: true,
        currentStatus: '0',
        newStatus: event.newStatus,
      };
    }
  }

  // async update(id: number, blockData: ContractEntity): Promise<void> {
  //   await this.blockDataRepository.update(id, blockData);
  // }

  // async delete(id: number): Promise<void> {
  //   await  this.blockDataRepository.delete(id);
  // }
}

/**
 * upstream Events from tradeContract to TradeFactory and listen only to TradeFactory! Modify with only TradeContracts can call.
 */
interface ExtraDataToUpdate {
  status?: string;
  lastBlockHeight?: number;
  buyerTradeUrl?: string;
  isDisputed?: boolean;
  disputeReason?: string;
}

// enum TradeStatus {
//   Pending = '0',
//   SellerCancelled = '1',
//   Committed = '2',
//   Accepted = '3',
//   Completed = '4',
//   Disputed = '5',
//   Resolved = '6',
//   Clawbacked = '7',
// }
