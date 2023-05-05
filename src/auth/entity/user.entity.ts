import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Puzzle } from '../../puzzle/entity/puzzle.entity';

@Entity()
@Unique(['provider', 'providerId'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 25, nullable: false })
  provider!: string;

  @Column({ type: 'varchar', nullable: false })
  providerId!: string;

  @Column({ type: 'varchar', default: null })
  email: string;

  @Column({ type: 'varchar', length: 30, default: null })
  nickname?: string;

  @Column({ type: 'bigint', default: null })
  birthdate?: number;

  @Column({ type: 'varchar', default: null })
  hashedRefreshToken?: string;

  @Column({ nullable: false, default: 3 })
  keyCount: number;

  @Column({ type: 'bigint', default: null })
  keyUpdateAt: number;

  @OneToMany(() => Puzzle, (puzzle) => puzzle.user)
  puzzles: Puzzle[];

  @CreateDateColumn({ type: 'datetime' })
  createAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', default: null })
  deleteAt: Date;
}
