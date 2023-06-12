import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractEntity } from './database/entities/contract-entity/contract.entity';
import { StatusHistoryEntity } from './database/entities/status-history/status-history.entity';
import { DatabaseService } from './database/database/database.service';
import { TrackerService } from './tracker/tracker.service';
import { Web3Service } from './web3-service/web3-service.service';
import { environment } from './web3-service/environment';

@Module({
  imports: [
    HttpModule,
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
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ContractEntity, StatusHistoryEntity]),
  ],
  controllers: [AppController],
  providers: [AppService, TrackerService, Web3Service, DatabaseService],
})
export class AppModule {}
