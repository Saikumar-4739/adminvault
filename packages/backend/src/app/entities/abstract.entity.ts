import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Record creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Record last update timestamp' })
  updatedAt: Date;
}
