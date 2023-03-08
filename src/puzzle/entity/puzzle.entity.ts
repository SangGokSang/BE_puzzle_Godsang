import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { Message } from '../../message/entity/message.entity';

@Entity()
export class Puzzle extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40, nullable: false })
  title: string;

  @ManyToOne(() => User, (user) => user.puzzles, { eager: false })
  user: User;

  @OneToMany(() => Message, (message) => message.puzzle, {
    eager: false,
    cascade: true,
  })
  messages: Message;

  @CreateDateColumn({ type: 'timestamp' })
  createAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
