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

  @Column({ type: 'timestamp', default: null })
  birthdate?: Date;

  @Column({ type: 'varchar', default: null })
  hashedRefreshToken?: string;

  @Column({ nullable: false, default: 3 })
  keyCount: number;

  @Column({ type: 'timestamp', nullable: false, default: null })
  keyUpdateAt: Date;

  @OneToMany(() => Puzzle, (puzzle) => puzzle.user, { eager: false })
  puzzles: Puzzle[];

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', default: null })
  deleteAt: Date;
}
