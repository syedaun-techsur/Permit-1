import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum NotificationType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  REVIEWER_ASSIGNED = 'REVIEWER_ASSIGNED',
  INFO_REQUEST = 'INFO_REQUEST',
  INFO_RESPONSE = 'INFO_RESPONSE',
  DECISION_MADE = 'DECISION_MADE',
}

@Entity('notifications')
@Index('idx_notif_user_id', ['userId'])
@Index('idx_notif_read', ['userId', 'read'])
@Index('idx_notif_created_at', ['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'application_id', type: 'uuid', nullable: true })
  applicationId: string | null;

  @Column({
    type: 'enum',
    enum: NotificationType,
    enumName: 'notification_type_enum',
  })
  type: NotificationType;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
