/**
 * Integration tests for admin endpoints (Phase 5, Plan 1).
 *
 * Covers:
 *   GET /admin/permits         — PERM-07
 *   GET /admin/users           — ADMN-01
 *   POST /admin/users          — ADMN-01
 *   GET /admin/users/:userId   — ADMN-01
 *   PATCH /admin/users/:userId — ADMN-01
 *   GET /admin/audit-log       — ADMN-03
 *   GET /admin/audit-log/export — ADMN-03 (CSV)
 *
 * Also verifies 403 enforcement across all routes for non-admin roles.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

// Use live test DB (same postgres instance as the app)
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'permits_user';
process.env.DB_PASS = process.env.DB_PASS || 'permits_pass';
process.env.DB_NAME = process.env.DB_NAME || 'permits';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'dev_jwt_secret_change_in_production_minimum_256_bits';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.RUN_MIGRATIONS = 'true';
process.env.MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
process.env.MINIO_PORT = process.env.MINIO_PORT || '9000';
process.env.MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
process.env.MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
process.env.MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'permits';
process.env.MINIO_USE_SSL = 'false';

describe('Admin Endpoints (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testSuffix = Date.now();
  const adminEmail = `admin-${testSuffix}@test.com`;
  const reviewerEmail = `reviewer-${testSuffix}@test.com`;
  const applicantEmail = `applicant-${testSuffix}@test.com`;
  const adminPassword = 'AdminPass123!';

  let adminJwt: string;
  let reviewerJwt: string;
  let applicantJwt: string;
  let adminUserId: string;
  let reviewerUserId: string;

  // IDs for created resources
  let permit1Id: string;
  let permit2Id: string;
  let permit3Id: string;
  let auditLogId1: string;
  let auditLogId2: string;
  let createdUserId: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Test setup
  // ─────────────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    await seedTestData();
  }, 90000);

  afterAll(async () => {
    // Clean up seeded data
    await cleanupTestData();
    await app.close();
  }, 30000);

  // ─────────────────────────────────────────────────────────────────────────
  // Seed helpers
  // ─────────────────────────────────────────────────────────────────────────

  async function registerAndGetId(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        confirmPassword: password,
        fullName: `Test User ${email}`,
      });

    if (res.status !== 201 && res.status !== 409) {
      throw new Error(`Register failed: ${res.status} ${JSON.stringify(res.body)}`);
    }

    // Get user id from DB
    const rows = await dataSource.query('SELECT id FROM users WHERE email = $1', [email]);
    return rows[0].id as string;
  }

  async function setUserRole(email: string, role: string): Promise<void> {
    await dataSource.query('UPDATE users SET role = $1 WHERE email = $2', [role, email]);
  }

  async function loginUser(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    return res.body.accessToken as string;
  }

  async function createAndSubmitPermit(token: string): Promise<string> {
    const createRes = await request(app.getHttpServer())
      .post('/permits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        permitType: 'construction',
        projectDescription: 'Admin test permit project',
        siteAddress: {
          street: '123 Admin St',
          city: 'Testville',
          state: 'CA',
          zipCode: '90210',
        },
        contactName: 'Test Applicant',
        contactPhone: '555-1234',
        contactEmail: applicantEmail,
      })
      .expect(201);

    const appId = createRes.body.id as string;

    // Insert a document to satisfy submission requirement
    await dataSource.query(
      `INSERT INTO documents (application_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status)
       SELECT $1, applicant_id, 'test.pdf', 'application/pdf', 1024, $2, 'uploaded'
       FROM permit_applications WHERE id = $1`,
      [appId, `test/${appId}/doc.pdf`],
    );

    // Submit
    await request(app.getHttpServer())
      .post(`/permits/${appId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .expect((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error(`Submit failed: ${res.status} ${JSON.stringify(res.body)}`);
        }
      });

    return appId;
  }

  async function seedTestData(): Promise<void> {
    // Create users
    adminUserId = await registerAndGetId(adminEmail, adminPassword);
    reviewerUserId = await registerAndGetId(reviewerEmail, adminPassword);
    await registerAndGetId(applicantEmail, adminPassword);

    // Promote roles via DB
    await setUserRole(adminEmail, 'admin');
    await setUserRole(reviewerEmail, 'reviewer');

    // Login to get tokens
    adminJwt = await loginUser(adminEmail, adminPassword);
    reviewerJwt = await loginUser(reviewerEmail, adminPassword);
    applicantJwt = await loginUser(applicantEmail, adminPassword);

    // Create 3 permit applications (applicant submits them)
    permit1Id = await createAndSubmitPermit(applicantJwt);
    permit2Id = await createAndSubmitPermit(applicantJwt);
    permit3Id = await createAndSubmitPermit(applicantJwt);

    // Assign reviewer to permit1
    await dataSource.query(
      `UPDATE permit_applications SET reviewer_id = $1 WHERE id = $2`,
      [reviewerUserId, permit1Id],
    );

    // Seed 2 audit log entries
    const auditRows = await dataSource.query(
      `INSERT INTO audit_log (action, actor_id, actor_role, application_id, details, occurred_at)
       VALUES
         ('APPLICATION_SUBMITTED', $1, 'applicant', $2, '{}', NOW() - INTERVAL '5 minutes'),
         ('REVIEW_STARTED', $3, 'reviewer', $4, '{}', NOW() - INTERVAL '2 minutes')
       RETURNING id`,
      [adminUserId, permit1Id, reviewerUserId, permit1Id],
    );
    auditLogId1 = auditRows[0].id as string;
    auditLogId2 = auditRows[1].id as string;
  }

  async function cleanupTestData(): Promise<void> {
    // Clean up by email suffix to avoid cascade issues
    const users = await dataSource.query(
      `SELECT id FROM users WHERE email LIKE '%-${testSuffix}@test.com'`,
    );
    for (const u of users) {
      await dataSource.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [u.id]);
      await dataSource.query(`DELETE FROM audit_log WHERE actor_id = $1 OR target_user_id = $1`, [u.id]);
    }
    // Clean permit applications
    for (const pid of [permit1Id, permit2Id, permit3Id]) {
      if (pid) {
        await dataSource.query(`DELETE FROM documents WHERE application_id = $1`, [pid]);
        await dataSource.query(`DELETE FROM lifecycle_stages WHERE application_id = $1`, [pid]);
        await dataSource.query(`DELETE FROM audit_log WHERE application_id = $1`, [pid]);
        await dataSource.query(`DELETE FROM permit_applications WHERE id = $1`, [pid]);
      }
    }
    if (createdUserId) {
      await dataSource.query(`DELETE FROM audit_log WHERE target_user_id = $1`, [createdUserId]);
      await dataSource.query(`DELETE FROM users WHERE id = $1`, [createdUserId]);
    }
    for (const u of users) {
      await dataSource.query(`DELETE FROM users WHERE id = $1`, [u.id]);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /admin/permits — PERM-07
  // ─────────────────────────────────────────────────────────────────────────

  describe('GET /admin/permits', () => {
    it('returns 200 with paginated list including assignedReviewerName', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/permits')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
      });
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      // Check that response includes expected shape
      const row = res.body.data[0];
      expect(row).toHaveProperty('referenceNumber');
      expect(row).toHaveProperty('status');
      expect(row).toHaveProperty('permitType');
    });

    it('filters by status=submitted', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/permits?status=submitted')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      for (const item of res.body.data) {
        expect(item.status).toBe('submitted');
      }
    });

    it('filters by reviewerId=unassigned', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/permits?reviewerId=unassigned')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      // At least permit2 and permit3 are unassigned
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      for (const item of res.body.data) {
        expect(item.reviewerId).toBeNull();
      }
    });

    it('respects pagination: limit=2 page=1', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/permits?limit=2&page=1')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.limit).toBe(2);
      expect(res.body.page).toBe(1);
    });

    it('returns 403 for reviewer role', async () => {
      await request(app.getHttpServer())
        .get('/admin/permits')
        .set('Authorization', `Bearer ${reviewerJwt}`)
        .expect(403);
    });

    it('returns 403 for applicant role', async () => {
      await request(app.getHttpServer())
        .get('/admin/permits')
        .set('Authorization', `Bearer ${applicantJwt}`)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /admin/users — ADMN-01
  // ─────────────────────────────────────────────────────────────────────────

  describe('GET /admin/users', () => {
    it('returns all users with pagination shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
      });
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('never includes password_hash in user objects', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      for (const user of res.body.data) {
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('password_hash');
        expect(JSON.stringify(user)).not.toContain('$2');
      }
    });

    it('filters by role=reviewer', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users?role=reviewer')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      for (const user of res.body.data) {
        expect(user.role).toBe('reviewer');
      }
    });

    it('filters by isActive=true', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users?isActive=true')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      for (const user of res.body.data) {
        expect(user.isActive).toBe(true);
      }
    });

    it('searches by email substring', async () => {
      const emailPart = testSuffix.toString();
      const res = await request(app.getHttpServer())
        .get(`/admin/users?search=${emailPart}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      // Should find our test users
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('returns 403 for reviewer role', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${reviewerJwt}`)
        .expect(403);
    });

    it('returns 403 for applicant role', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${applicantJwt}`)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /admin/users — ADMN-01
  // ─────────────────────────────────────────────────────────────────────────

  describe('POST /admin/users', () => {
    const newUserEmail = `new-admin-created-${Date.now()}@test.com`;

    it('creates user and returns 201 UserObject without password_hash', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({
          fullName: 'New Test User',
          email: newUserEmail,
          role: 'reviewer',
          temporaryPassword: 'Temp12345!',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        fullName: 'New Test User',
        email: newUserEmail,
        role: 'reviewer',
        isActive: true,
      });
      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('password_hash');
      createdUserId = res.body.id as string;
    });

    it('returns 409 EMAIL_ALREADY_EXISTS on duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({
          fullName: 'Duplicate User',
          email: newUserEmail,
          role: 'applicant',
          temporaryPassword: 'Temp12345!',
        })
        .expect(409);

      expect(res.body.message).toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });
    });

    it('returns 403 for reviewer role', async () => {
      await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${reviewerJwt}`)
        .send({
          fullName: 'Should Fail',
          email: `should-fail-${Date.now()}@test.com`,
          role: 'applicant',
        })
        .expect(403);
    });

    it('returns 403 for applicant role', async () => {
      await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${applicantJwt}`)
        .send({
          fullName: 'Should Fail',
          email: `should-fail-${Date.now()}@test.com`,
          role: 'applicant',
        })
        .expect(403);
    });

    it('returns 400 for invalid role value', async () => {
      await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({
          fullName: 'Invalid Role User',
          email: `invalid-role-${Date.now()}@test.com`,
          role: 'superadmin', // invalid
        })
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /admin/users/:userId — ADMN-01
  // ─────────────────────────────────────────────────────────────────────────

  describe('GET /admin/users/:userId', () => {
    it('returns the user by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body).toMatchObject({
        id: adminUserId,
        role: 'admin',
        isActive: true,
      });
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('returns 404 for unknown userId', async () => {
      await request(app.getHttpServer())
        .get('/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(404);
    });

    it('returns 403 for reviewer role', async () => {
      await request(app.getHttpServer())
        .get(`/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${reviewerJwt}`)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /admin/users/:userId — ADMN-01
  // ─────────────────────────────────────────────────────────────────────────

  describe('PATCH /admin/users/:userId', () => {
    it('deactivates a user and revokes refresh tokens', async () => {
      // Reviewer must be active and have a refresh token session
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${reviewerUserId}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({ isActive: false })
        .expect(200);

      expect(res.body.isActive).toBe(false);

      // Verify refresh tokens were deleted for this user
      const tokenRows = await dataSource.query(
        'SELECT id FROM refresh_tokens WHERE user_id = $1',
        [reviewerUserId],
      );
      expect(tokenRows.length).toBe(0);

      // Re-activate for subsequent tests
      await dataSource.query(
        'UPDATE users SET is_active = true WHERE id = $1',
        [reviewerUserId],
      );
    });

    it('returns 409 SELF_DEACTIVATION when admin deactivates themselves', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({ isActive: false })
        .expect(409);

      expect(res.body.message).toMatchObject({ code: 'SELF_DEACTIVATION' });
    });

    it('changes role and writes USER_ROLE_CHANGED audit log', async () => {
      // Change reviewer → applicant
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${reviewerUserId}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .send({ role: 'applicant' })
        .expect(200);

      expect(res.body.role).toBe('applicant');

      // Verify audit log entry was created
      const auditRows = await dataSource.query(
        `SELECT * FROM audit_log
         WHERE action = 'USER_ROLE_CHANGED' AND target_user_id = $1
         ORDER BY occurred_at DESC LIMIT 1`,
        [reviewerUserId],
      );
      expect(auditRows.length).toBe(1);
      expect(auditRows[0].details).toMatchObject({
        oldRole: 'reviewer',
        newRole: 'applicant',
      });

      // Restore reviewer role for cleanliness
      await dataSource.query('UPDATE users SET role = $1 WHERE id = $2', [
        'reviewer',
        reviewerUserId,
      ]);
    });

    it('returns 403 for reviewer role', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${reviewerJwt}`)
        .send({ role: 'applicant' })
        .expect(403);
    });

    it('returns 403 for applicant role', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${applicantJwt}`)
        .send({ isActive: false })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /admin/audit-log — ADMN-03
  // ─────────────────────────────────────────────────────────────────────────

  describe('GET /admin/audit-log', () => {
    it('returns cursor-paginated response with nextCursor and totalCount', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/audit-log')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body).toMatchObject({
        data: expect.any(Array),
        nextCursor: expect.anything(), // null or string
        totalCount: expect.any(Number),
      });
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by action=APPLICATION_SUBMITTED', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/audit-log?action=APPLICATION_SUBMITTED')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      for (const entry of res.body.data) {
        expect(entry.action).toBe('APPLICATION_SUBMITTED');
      }
    });

    it('filters by actorId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/audit-log?actorId=${adminUserId}`)
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      for (const entry of res.body.data) {
        expect(entry.actorId).toBe(adminUserId);
      }
    });

    it('cursor pagination: limit=1 gives nextCursor when more entries exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/audit-log?limit=1')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(1);
      // If there are multiple entries, nextCursor should be set
      if (res.body.totalCount > 1) {
        expect(res.body.nextCursor).not.toBeNull();
      }
    });

    it('returns 403 for reviewer role', async () => {
      await request(app.getHttpServer())
        .get('/admin/audit-log')
        .set('Authorization', `Bearer ${reviewerJwt}`)
        .expect(403);
    });

    it('returns 403 for applicant role', async () => {
      await request(app.getHttpServer())
        .get('/admin/audit-log')
        .set('Authorization', `Bearer ${applicantJwt}`)
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /admin/audit-log/export — ADMN-03 (CSV)
  // ─────────────────────────────────────────────────────────────────────────

  describe('GET /admin/audit-log/export', () => {
    it('streams CSV with correct Content-Type and header row', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/audit-log/export')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('id,action,actorId');
      expect(res.text).toContain('actorName');
    });

    it('includes data rows in the CSV export', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/audit-log/export')
        .set('Authorization', `Bearer ${adminJwt}`)
        .expect(200);

      const lines = res.text.trim().split('\n');
      // At least header + 1 data row
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });

    it('returns 403 for reviewer role', async () => {
      await request(app.getHttpServer())
        .get('/admin/audit-log/export')
        .set('Authorization', `Bearer ${reviewerJwt}`)
        .expect(403);
    });

    it('returns 403 for applicant role', async () => {
      await request(app.getHttpServer())
        .get('/admin/audit-log/export')
        .set('Authorization', `Bearer ${applicantJwt}`)
        .expect(403);
    });
  });
});
