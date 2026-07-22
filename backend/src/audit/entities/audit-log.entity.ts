import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('audit_log')
@Index('idx_al_action', ['action'])
@Index('idx_al_actor_id', ['actorId'])
@Index('idx_al_application_id', ['applicationId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  action: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ name: 'actor_role', type: 'varchar', length: 20, nullable: true })
  actorRole: string | null;

  @Column({ name: 'application_id', type: 'uuid', nullable: true })
  applicationId: string | null;

  @Column({ name: 'target_user_id', type: 'uuid', nullable: true })
  targetUserId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'NOW()' })
  occurredAt: Date;
}
