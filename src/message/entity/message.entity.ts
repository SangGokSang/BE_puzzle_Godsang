import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Puzzle } from '../../puzzle/entity/puzzle.entity';
import { User } from '../../auth/entity/user.entity';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column({ nullable: false })
  content: string;
  @ManyToOne(() => Puzzle, (puzzle) => puzzle.messages, { eager: false })
  puzzle: Puzzle;
  @ManyToOne(() => User)
  receiver: User;
  @ManyToOne(() => User)
  sender: User;
  @CreateDateColumn()
  createAt: string;
  @Column({ nullable: false })
  isOpen: boolean;
}
