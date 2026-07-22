import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  DELETED = 'deleted',
  SUPERSEDED = 'superseded',
}

@Entity('documents')
@Index('idx_docs_application_id', ['applicationId'])
@Index('idx_docs_status', ['status'])
@Index('idx_docs_uploaded_by', ['uploadedBy'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  uploadedBy: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'document_type', type: 'varchar', length: 100, nullable: true })
  documentType: string | null;

  @Column({ name: 'storage_key', type: 'text' })
  storageKey: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    enumName: 'document_status_enum',
    default: DocumentStatus.UPLOADED,
  })
  status: DocumentStatus;

  @Column({ name: 'superseded_by', type: 'uuid', nullable: true })
  supersededBy: string | null;

  @Column({ name: 'uploaded_at', type: 'timestamptz', default: () => 'NOW()' })
  uploadedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
