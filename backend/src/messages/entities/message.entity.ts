import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { PermitApplication } from '../../permits/entities/permit-application.entity';
import { User } from '../../users/users.entity';
import { MessageRead } from './message-read.entity';
import { MessageAttachment } from './message-attachment.entity';

@Entity('messages')
@Index('idx_messages_application_id', ['applicationId'])
@Index('idx_messages_sender_id', ['senderId'])
@Index('idx_messages_sent_at', ['sentAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @ManyToOne(() => PermitApplication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: PermitApplication;

  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'sent_at', type: 'timestamptz', default: () => 'NOW()' })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => MessageRead, (mr) => mr.message, { eager: false })
  reads: MessageRead[];

  @OneToMany(() => MessageAttachment, (ma) => ma.message, { eager: false })
  attachments: MessageAttachment[];
}
