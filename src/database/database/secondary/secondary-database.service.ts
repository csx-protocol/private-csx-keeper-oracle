/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { UserStorageEntity } from '../../entities/secondary/user-storage/user-storage.entity';
import { Repository } from 'typeorm';

export interface UserDto {
  address: string;
  apiKey: string;
}

export interface UserStoragePostResponseDto {
  saved: boolean;
  data?: UserStorageEntity;
  error?: string;
}

export interface UserStorageGetResponseDto {
  data?: UserStorageEntity;
  error?: string;
}

@Injectable()
export class SecondaryDatabaseService {
  constructor(
    @InjectRepository(UserStorageEntity, 'secondaryConnection')
    private userRepository: Repository<UserStorageEntity>,
  ) {}

  async getUser(_address: string): Promise<UserStorageGetResponseDto> {
    try {
      const existingEntryWithEthAddress = await this.userRepository.findOne({
        where: {
          address: _address.toLowerCase(),
        },
      });

      if (!existingEntryWithEthAddress) {
        return {
          error: 'ADDRESS_NOT_FOUND',
        } as UserStorageGetResponseDto;
      }

      return {
        data: existingEntryWithEthAddress,
      } as UserStorageGetResponseDto;
    } catch (error) {
      return {
        error: error.message,
      } as UserStorageGetResponseDto;
    }
  }

  async isApiKeyValid(_apiKey: string): Promise<boolean> {
    try {
      const gabenSteamId = '76561197960287930';
      await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${_apiKey}&steamids=${gabenSteamId}`,
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
