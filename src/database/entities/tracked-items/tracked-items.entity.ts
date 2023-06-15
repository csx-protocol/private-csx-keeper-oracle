/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
