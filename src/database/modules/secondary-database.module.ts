/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { environment } from '../../web3-service/environment';
import { UserStorageEntity } from '../entities/secondary/user-storage/user-storage.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'secondaryConnection', // Unique name for the secondary connection
      type: 'postgres',
      host: environment.database.host,
      port: parseInt(environment.database.port),
      username: environment.database.username,
      password: environment.database.password,
      database: environment.database.secondaryDatabase,
      entities: [UserStorageEntity],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
        ca: environment.database.caCert,
      },
    }),
    TypeOrmModule.forFeature([UserStorageEntity], 'secondaryConnection'),
  ],
  exports: [TypeOrmModule],
})
export class SecondaryDatabaseModule {}