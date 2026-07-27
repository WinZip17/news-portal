import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}