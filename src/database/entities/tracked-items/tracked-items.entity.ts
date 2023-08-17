/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn
} from 'typeorm';

export enum ItemState {
  TRACKING_SELLER = 'TRACKING_SELLER',
  TRACKING_BUYER = 'TRACKING_BUYER',
  COMPLETED = 'COMPLETED',
}

@Entity('tracked_items')
export class TrackedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originId: string;

  @Column()
  destinationId: string;

  @Column()
  assetId: string;

  @Column()
  market_hash_name: string;

  @Column('jsonb')
  details: {
    floatValue: number;
    paintSeed: number;
    paintIndex: number;
  };

  @Column()
  similarItemsCount: number;

  @Column({
    type: 'enum',
    enum: ItemState,
    default: ItemState.TRACKING_SELLER,
  })
  state: ItemState;

  @Column()
  contractAddress: string;
}
