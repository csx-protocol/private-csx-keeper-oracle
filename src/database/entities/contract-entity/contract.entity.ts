import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { StatusHistoryEntity } from '../status-history/status-history.entity';

@Entity()
export class ContractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  assetId: string;

  @Column()
  @Index()
  contractAddress: string;

  @Column()
  itemMarketName: string;

  @Column('jsonb')
  details: {
    floatValue: number;
    paintSeed: number;
    paintIndex: number;
  };

  @Column()
  status: string;

  @Column()
  sellerTradeUrl: string;

  @Column()
  buyerTradeUrl: string;

  @Column()
  @Index()
  isDisputed: boolean;

  @Column()
  disputeReason: string;

  @Column()
  lastBlockHeight: number;

  @OneToMany(() => StatusHistoryEntity, (history) => history.contract)
  statusHistory: StatusHistoryEntity[];
}
