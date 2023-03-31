/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appid: number;

  @Column()
  contextid: string;

  @Column()
  assetid: string;

  @Column()
  classid: string;

  @Column()
  instanceid: string;

  @Column()
  amount: string;

  @Column()
  currency: number;

  @Column()
  background_color: string;

  @Column()
  icon_url: string;

  @Column({ nullable: true })
  icon_url_large: string;

  @Column({ type: 'simple-array' })
  descriptions: any[];

  @Column()
  tradable: number;

  @Column('text', { array: true })
  actions: any[];

  @Column()
  name: string;

  @Column()
  name_color: string;

  @Column()
  type: string;

  @Column()
  market_name: string;

  @Column()
  market_hash_name: string;

  @Column({ nullable: true, type: 'simple-array' })
  market_actions: any[];

  @Column()
  commodity: number;

  @Column()
  market_tradable_restriction: number;

  @Column()
  marketable: number;

  @Column({ type: 'simple-array' })
  tags: any[];

  @Column({ nullable: true })
  market_buy_country_restriction: string;
}
