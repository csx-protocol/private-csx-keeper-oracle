/* eslint-disable prettier/prettier */
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ContractEntity } from '../contract-entity/contract.entity';

@Entity()
export class StatusHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContractEntity, (contract) => contract.statusHistory)
  @JoinColumn({ name: 'contract_address' })
  contract: ContractEntity;

  @Column()
  status: string;

  @Column()
  blockHeight: number;
}
