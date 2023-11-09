import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrimaryDatabaseModule } from './database/modules/primary-database.module';
import { SecondaryDatabaseModule } from './database/modules/secondary-database.module';
import { AppController } from './app.controller';
import { TrackerService } from './tracker-service/tracker.service';
import { Web3Service } from './web3-service/web3.service';
import { FloatApiService } from './float-api/float-api.service';
import { WalletService } from './web3-service/wallet.service';
import { TrackService } from './tracker-service/track.service';
import { PrimaryDatabaseService } from './database/database/primary/database.service';
import { SecondaryDatabaseService } from './database/database/secondary/secondary-database.service';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrimaryDatabaseModule, // Now using the separated primary database module
    SecondaryDatabaseModule, // The new module for the secondary database
  ],
  controllers: [AppController],
  providers: [
    TrackerService,
    TrackService,
    FloatApiService,
    Web3Service,
    WalletService,
    PrimaryDatabaseService,
    SecondaryDatabaseService,
  ],
})
export class AppModule {}
