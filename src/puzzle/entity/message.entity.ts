import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Puzzle } from './puzzle.entity';
import { MessageDto } from '../dto/message.dto';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  senderId: number;

  @Column({ nullable: false })
  displayOrder: number;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => Puzzle, (puzzle) => puzzle.messages, {
    eager: false,
    onDelete: 'CASCADE',
  })
  puzzle: Puzzle;

  @Column({ type: 'varchar', length: 60, nullable: false })
  from: string;

  @Column({ type: 'varchar', length: 60, nullable: false })
  to: string;

  @Column({ nullable: false })
  isOpened: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createAt: Date;

  toDto(): MessageDto {
    return {
      id: this.id,
      displayOrder: this.displayOrder,
      content: this.content,
      from: this.from,
      to: this.to,
      isOpened: this.isOpened,
    };
  }
}
