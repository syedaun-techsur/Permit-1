import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000001 implements MigrationInterface {
  name = 'InitialSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // user_role enum
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('applicant', 'reviewer', 'admin')
    `);

    // users table — exact from TechArch
    await queryRunner.query(`
      CREATE TABLE users (
        id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        email           TEXT            NOT NULL UNIQUE,
        password_hash   TEXT            NOT NULL,
        full_name       TEXT            NOT NULL,
        role            user_role       NOT NULL DEFAULT 'applicant',
        is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
        created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_users_email ON users (email)`);
    await queryRunner.query(`CREATE INDEX idx_users_role ON users (role)`);
    await queryRunner.query(`CREATE INDEX idx_users_is_active ON users (is_active)`);

    // refresh_tokens table — exact from TechArch
    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  TEXT NOT NULL UNIQUE,
        expires_at  TIMESTAMPTZ NOT NULL,
        revoked     BOOLEAN NOT NULL DEFAULT FALSE,
        revoked_at  TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash)`);

    // password_reset_tokens table — exact from TechArch
    await queryRunner.query(`
      CREATE TABLE password_reset_tokens (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  TEXT        NOT NULL UNIQUE,
        expires_at  TIMESTAMPTZ NOT NULL,
        used_at     TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_prt_user ON password_reset_tokens (user_id)`);
    await queryRunner.query(`CREATE INDEX idx_prt_token ON password_reset_tokens (token_hash)`);
    await queryRunner.query(`CREATE INDEX idx_prt_expires ON password_reset_tokens (expires_at)`);

    // updated_at trigger — exact from TechArch
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at ON users`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS trigger_set_updated_at`);
    await queryRunner.query(`DROP TABLE IF EXISTS password_reset_tokens`);
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role`);
  }
}
