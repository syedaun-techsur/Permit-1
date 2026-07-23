/**
 * Integration tests for Phase 4 dashboard endpoints.
 *
 * Tests:
 *   GET /dashboard/applicant  — Applicant role
 *   GET /dashboard/reviewer   — Reviewer/Admin role
 *   GET /dashboard/admin      — Admin role
 *
 * Each endpoint: 401 unauthenticated, 403 wrong role, 200 correct shape
 *
 * Tests tolerate an empty DB gracefully (all counts return 0, arrays return []).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

// Use live test DB via env vars (same postgres instance as the app)
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

describe('Dashboard Endpoints (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let applicantToken: string;
  let reviewerToken: string;
  let adminToken: string;

  const testSuffix = Date.now();
  const applicantEmail = `dash-applicant-${testSuffix}@test.com`;
  const reviewerEmail = `dash-reviewer-${testSuffix}@test.com`;
  const adminEmail = `dash-admin-${testSuffix}@test.com`;

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
  }, 60000);

  afterAll(async () => {
    await app.close();
  }, 30000);

  // ── Helpers ──────────────────────────────────────────────────────────────

  async function registerUser(email: string): Promise<void> {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        fullName: `Dashboard Test User`,
      });
    if (res.status !== 201 && res.status !== 409) {
      throw new Error(`Register failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
  }

  async function loginUser(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'TestPass123!' })
      .expect(200);
    return res.body.accessToken as string;
  }

  async function setUserRole(email: string, role: string): Promise<void> {
    await dataSource.query(`UPDATE users SET role = $1 WHERE email = $2`, [role, email]);
  }

  // ── Setup ────────────────────────────────────────────────────────────────

  it(
    'should set up test users for all three roles',
    async () => {
      await registerUser(applicantEmail);
      await registerUser(reviewerEmail);
      await registerUser(adminEmail);

      await setUserRole(reviewerEmail, 'reviewer');
      await setUserRole(adminEmail, 'admin');

      applicantToken = await loginUser(applicantEmail);
      reviewerToken = await loginUser(reviewerEmail);
      adminToken = await loginUser(adminEmail);

      expect(applicantToken).toBeTruthy();
      expect(reviewerToken).toBeTruthy();
      expect(adminToken).toBeTruthy();
    },
    30000,
  );

  // ── GET /dashboard/applicant ─────────────────────────────────────────────

  describe('GET /dashboard/applicant', () => {
    it('returns 401 when unauthenticated', () =>
      request(app.getHttpServer()).get('/dashboard/applicant').expect(401));

    it('returns 403 when called as reviewer', async () => {
      if (!reviewerToken) return;
      await request(app.getHttpServer())
        .get('/dashboard/applicant')
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(403);
    });

    it('returns 200 with correct response shape for applicant', async () => {
      if (!applicantToken) return;
      const res = await request(app.getHttpServer())
        .get('/dashboard/applicant')
        .set('Authorization', `Bearer ${applicantToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        summaryCards: {
          activeApplications: expect.any(Number),
          actionRequired: expect.any(Number),
          unreadMessages: expect.any(Number),
        },
        recentApplications: expect.any(Array),
        pendingActions: expect.any(Array),
        activityFeed: expect.any(Array),
      });
    });
  });

  // ── GET /dashboard/reviewer ──────────────────────────────────────────────

  describe('GET /dashboard/reviewer', () => {
    it('returns 401 when unauthenticated', () =>
      request(app.getHttpServer()).get('/dashboard/reviewer').expect(401));

    it('returns 403 when called as applicant', async () => {
      if (!applicantToken) return;
      await request(app.getHttpServer())
        .get('/dashboard/reviewer')
        .set('Authorization', `Bearer ${applicantToken}`)
        .expect(403);
    });

    it('returns 200 with correct response shape for reviewer', async () => {
      if (!reviewerToken) return;
      const res = await request(app.getHttpServer())
        .get('/dashboard/reviewer')
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        summaryCards: {
          assignedApplications: expect.any(Number),
          awaitingResponse: expect.any(Number),
          unassignedInPool: expect.any(Number),
          unreadMessages: expect.any(Number),
        },
        priorityQueue: expect.any(Array),
        atRiskApplications: expect.any(Array),
        activityFeed: expect.any(Array),
      });
    });
  });

  // ── GET /dashboard/admin ─────────────────────────────────────────────────

  describe('GET /dashboard/admin', () => {
    it('returns 401 when unauthenticated', () =>
      request(app.getHttpServer()).get('/dashboard/admin').expect(401));

    it('returns 403 when called as applicant', async () => {
      if (!applicantToken) return;
      await request(app.getHttpServer())
        .get('/dashboard/admin')
        .set('Authorization', `Bearer ${applicantToken}`)
        .expect(403);
    });

    it('returns 200 with correct response shape for admin', async () => {
      if (!adminToken) return;
      const res = await request(app.getHttpServer())
        .get('/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        summaryCards: {
          totalApplications: expect.any(Number),
          activeApplications: expect.any(Number),
          submittedThisWeek: expect.any(Number),
          decisionsThisWeek: expect.any(Number),
        },
        statusDistribution: expect.any(Array),
        reviewerWorkload: expect.any(Array),
        recentActivity: expect.any(Array),
      });

      // Verify statusDistribution item shape (if data exists)
      if (res.body.statusDistribution.length > 0) {
        expect(res.body.statusDistribution[0]).toMatchObject({
          status: expect.any(String),
          count: expect.any(Number),
        });
      }

      // Verify reviewerWorkload item shape (if data exists)
      if (res.body.reviewerWorkload.length > 0) {
        expect(res.body.reviewerWorkload[0]).toMatchObject({
          reviewerId: expect.any(String),
          reviewerName: expect.any(String),
          assigned: expect.any(Number),
          underReview: expect.any(Number),
          additionalInfoNeeded: expect.any(Number),
          decidedThisWeek: expect.any(Number),
        });
      }
    });
  });
});
