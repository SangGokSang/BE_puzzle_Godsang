import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Puzzle } from './puzzle.entity';
import { User } from '../../auth/entity/user.entity';
import { MessageDto } from '../dto/message.dto';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => Puzzle, (puzzle) => puzzle.messages, { eager: false })
  puzzle: Puzzle;

  @Column({ type: 'varchar', length: 25, nullable: false })
  senderNickname: string;

  @Column({ nullable: false })
  isOpened: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;

  toDto(): MessageDto {
    return {
      id: this.id,
      content: this.content,
      senderNickname: this.senderNickname,
      isOpened: this.isOpened,
    };
  }
}
