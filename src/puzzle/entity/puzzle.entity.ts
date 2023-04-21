import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { Message } from './message.entity';
import { PuzzleDto } from '../dto/puzzle.dto';

@Entity()
export class Puzzle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;
  @Column({ type: 'varchar', length: 20, nullable: false })
  category: string;

  @ManyToOne(() => User, (user) => user.puzzles, { eager: true })
  user: User;

  @OneToMany(() => Message, (message) => message.puzzle, {
    eager: true,
    cascade: true,
  })
  messages: Message[];

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  toDto(): PuzzleDto {
    return {
      id: this.id,
      category: this.category,
      title: this.title,
      messages: this.messages.map((messageEntity) => messageEntity.toDto()),
      userNickname: this.user.nickname,
    };
  }
}
