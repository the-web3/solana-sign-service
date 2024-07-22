import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Addresses {
  @PrimaryColumn({ type: 'bytea' })
  hash: string;

  @Column({ type: 'numeric', precision: 100 })
  fetched_coin_balance: string;

  @Column({ type: 'int8' })
  fetched_coin_balance_block_number: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  inserted_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
