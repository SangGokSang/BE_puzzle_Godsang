import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Puzzle } from '../../puzzle/entity/puzzle.entity';
import { OAuthProvider } from './provider.enum';

@Entity()
@Unique(['provider', 'email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: OAuthProvider, nullable: false })
  provider!: OAuthProvider;

  @Column({ type: 'varchar', nullable: false })
  email!: string;

  @Column({ type: 'varchar', length: 15, default: null })
  nickname?: string;

  @Column({ type: 'timestamp', default: null })
  birthdate?: Date;

  @Column({ type: 'varchar', default: null })
  hashedRefreshToken?: string;

  @Column({ nullable: false, default: 3 })
  keyCount: number;

  @OneToMany(() => Puzzle, (puzzle) => puzzle.user, { eager: false })
  puzzles: Puzzle[];

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
