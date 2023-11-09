/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { environment } from '../../web3-service/environment';
import { ContractEntity } from '../entities/primary/contract-entity/contract.entity';
import { StatusHistoryEntity } from '../entities/primary/status-history/status-history.entity';
import { TrackedItem } from '../entities/primary/tracked-items/tracked-items.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'primaryConnection', 
      type: 'postgres',
      host: environment.database.host,
      port: parseInt(environment.database.port),
      username: environment.database.username,
      password: environment.database.password,
      database: environment.database.primaryDatabase,
      entities: [ContractEntity, StatusHistoryEntity, TrackedItem],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
        ca: environment.database.caCert,
      },
    }),
    TypeOrmModule.forFeature([
      ContractEntity,
      StatusHistoryEntity,
      TrackedItem,
    ], 'primaryConnection'),
  ],
  exports: [TypeOrmModule],
})
export class PrimaryDatabaseModule {}