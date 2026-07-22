import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 3 — Messages, MessageReads, MessageAttachments tables.
 *
 * All statements are idempotent (IF NOT EXISTS) so a re-run over a
 * partially-applied database is safe.
 */
export class Phase3Messages1700000000003 implements MigrationInterface {
  name = 'Phase3Messages1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── messages ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
        sender_id      UUID NOT NULL REFERENCES users(id),
        body           TEXT NOT NULL,
        sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_messages_application_id ON messages(application_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at)`,
    );

    // ── message_reads ────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS message_reads (
        message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (message_id, user_id)
      );
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_mr_user_id ON message_reads(user_id)`,
    );

    // ── message_attachments ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS message_attachments (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id   UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        filename     VARCHAR(255) NOT NULL,
        mime_type    VARCHAR(100) NOT NULL,
        size_bytes   BIGINT NOT NULL,
        storage_key  TEXT NOT NULL,
        uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_ma_message_id ON message_attachments(message_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS message_attachments`);
    await queryRunner.query(`DROP TABLE IF EXISTS message_reads`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages`);
  }
}
