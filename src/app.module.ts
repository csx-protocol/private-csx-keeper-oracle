import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ContractEntity } from './database/entities/contract-entity/contract.entity';
import { StatusHistoryEntity } from './database/entities/status-history/status-history.entity';
import { DatabaseService } from './database/database/database.service';
import { TrackerService } from './tracker-service/tracker.service';
import { Web3Service } from './web3-service/web3.service';
import { environment } from './web3-service/environment';
import { FloatApiService } from './float-api/float-api.service';
import { WalletService } from './web3-service/wallet.service';
import { TrackService } from './tracker-service/track.service';
import { TrackedItem } from './database/entities/tracked-items/tracked-items.entity';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: environment.database.host,
      port: parseInt(environment.database.port),
      username: environment.database.username,
      password: environment.database.password,
      database: environment.database.database,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
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
    ]),
  ],
  controllers: [AppController],
  providers: [
    TrackerService,
    TrackService,
    FloatApiService,
    Web3Service,
    WalletService,
    DatabaseService,
  ],
})
export class AppModule {}
