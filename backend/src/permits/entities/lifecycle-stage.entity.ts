import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';
import { ApplicationStatus } from './permit-application.entity';

@Entity('lifecycle_stages')
@Index('idx_ls_application_id', ['applicationId'])
@Index('idx_ls_entered_at', ['enteredAt'])
export class LifecycleStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    enumName: 'application_status_enum',
  })
  stage: ApplicationStatus;

  @Column({ name: 'entered_at', type: 'timestamptz', default: () => 'NOW()' })
  enteredAt: Date;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;
}
