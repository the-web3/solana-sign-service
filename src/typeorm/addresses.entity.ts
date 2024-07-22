import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Addresses {
  @PrimaryColumn({ type: 'bytea' })
  guid: string;

  @Column({ type: 'bytea' })
  user_uid: string;

  @Column({ type: 'bytea' })
  address: string;

  @Column({ type: 'bytea'})
  private_key: string;

  @Column({ type: 'bytea'})
  public_key: string;

  @Column({ type: 'int8' })
  address_type: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
