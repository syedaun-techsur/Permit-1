import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from '../../users/users.entity';

@Entity('message_reads')
export class MessageRead {
  @PrimaryColumn({ name: 'message_id' })
  messageId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Message, (m) => m.reads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'read_at', type: 'timestamptz', default: () => 'NOW()' })
  readAt: Date;
}
