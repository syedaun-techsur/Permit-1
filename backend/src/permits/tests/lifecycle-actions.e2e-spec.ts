/**
 * Integration tests for Phase 3 lifecycle action endpoints.
 *
 * Tests the full lifecycle flow:
 *   submitted → under_review → additional_info_needed → under_review → approved/rejected
 *
 * Also tests:
 *   - 409 ConflictException on wrong-status calls
 *   - 403 ForbiddenException on wrong-role calls
 *   - 400 on invalid input
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

describe('Lifecycle Action Endpoints (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  // Tokens and IDs shared across tests in the suite
  let reviewerToken: string;
  let applicantToken: string;
  let permitId: string;

  const testSuffix = Date.now();
  const reviewerEmail = `reviewer-${testSuffix}@test.com`;
  const applicantEmail = `applicant-${testSuffix}@test.com`;

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

  // ── Setup helpers ──────────────────────────────────────────────────────

  async function registerUser(email: string): Promise<void> {
    // Register via API (creates APPLICANT role by default)
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        fullName: `Test User`,
      });

    if (res.status !== 201 && res.status !== 409) {
      throw new Error(
        `Register failed: ${res.status} ${JSON.stringify(res.body)}`,
      );
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
    // Directly update role via DB — role is not settable via API (applicants only via register)
    await dataSource.query(`UPDATE users SET role = $1 WHERE email = $2`, [
      role,
      email,
    ]);
  }

  async function createAndSubmitPermit(token: string): Promise<string> {
    // Create draft
    const createRes = await request(app.getHttpServer())
      .post('/permits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        permitType: 'construction',
        projectDescription: 'Test project for lifecycle integration tests',
        siteAddress: {
          street: '123 Test St',
          city: 'Testville',
          state: 'CA',
          zipCode: '90210',
        },
        contactName: 'Test Applicant',
        contactPhone: '555-1234',
        contactEmail: 'applicant@test.com',
      })
      .expect(201);

    const appId = createRes.body.id as string;

    // Insert a document directly via DB to satisfy submission requirement
    await dataSource.query(
      `INSERT INTO documents (application_id, uploaded_by, filename, mime_type, size_bytes, storage_key, status)
       SELECT $1, applicant_id, 'test.pdf', 'application/pdf', 1024, $2, 'uploaded'
       FROM permit_applications WHERE id = $1`,
      [appId, `test/${appId}/doc.pdf`],
    );

    // Submit (NestJS @Post defaults to 201)
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

  // ── Test: Setup ────────────────────────────────────────────────────────

  it(
    'should register reviewer and applicant, create+submit permit',
    async () => {
      // Register both as applicants first
      await registerUser(reviewerEmail);
      await registerUser(applicantEmail);

      // Promote reviewer role via DB
      await setUserRole(reviewerEmail, 'reviewer');

      // Get fresh tokens with correct roles
      reviewerToken = await loginUser(reviewerEmail);
      applicantToken = await loginUser(applicantEmail);

      // Create + submit permit as applicant
      permitId = await createAndSubmitPermit(applicantToken);

      expect(reviewerToken).toBeTruthy();
      expect(applicantToken).toBeTruthy();
      expect(permitId).toBeTruthy();
    },
    30000,
  );

  // ── Test: RBAC enforcement ─────────────────────────────────────────────

  it('should return 403 when applicant tries to begin-review', async () => {
    await request(app.getHttpServer())
      .post(`/permits/${permitId}/actions/begin-review`)
      .set('Authorization', `Bearer ${applicantToken}`)
      .expect(403);
  });

  it(
    'should return 403 when reviewer tries to respond-to-info (wrong role)',
    async () => {
      await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/respond-to-info`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({ responseNote: 'Some response' })
        .expect(403);
    },
  );

  // ── Test: begin-review ─────────────────────────────────────────────────

  it(
    'should transition permit to under_review via begin-review',
    async () => {
      const res = await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/begin-review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(200);

      expect(res.body.status).toBe('under_review');
    },
  );

  it(
    'should return 409 when calling begin-review on already under_review permit',
    async () => {
      await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/begin-review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(409);
    },
  );

  // ── Test: request-info ─────────────────────────────────────────────────

  it(
    'should transition permit to additional_info_needed via request-info',
    async () => {
      const res = await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/request-info`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          infoRequestNote:
            'Please provide additional structural documents for the project.',
        })
        .expect(200);

      expect(res.body.status).toBe('additional_info_needed');
      expect(res.body.infoRequestNote).toBeTruthy();
    },
  );

  it(
    'should return 409 when calling request-info on additional_info_needed permit',
    async () => {
      await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/request-info`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({ infoRequestNote: 'Another request that should fail' })
        .expect(409);
    },
  );

  // ── Test: respond-to-info ──────────────────────────────────────────────

  it(
    'should transition permit back to under_review via respond-to-info',
    async () => {
      const res = await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/respond-to-info`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          responseNote:
            'Here are the requested structural documents in the attached files.',
        })
        .expect(200);

      expect(res.body.status).toBe('under_review');
      expect(res.body.infoResponseNote).toBeTruthy();
    },
  );

  it(
    'should return 409 when calling respond-to-info on under_review permit',
    async () => {
      await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/respond-to-info`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ responseNote: 'This should fail' })
        .expect(409);
    },
  );

  // ── Test: decide (approve) ─────────────────────────────────────────────

  it('should transition permit to approved via decide', async () => {
    const res = await request(app.getHttpServer())
      .post(`/permits/${permitId}/actions/decide`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        outcome: 'approved',
        decisionReason:
          'All requirements met. The construction project meets all zoning and safety requirements.',
      })
      .expect(200);

    expect(res.body.status).toBe('approved');
    expect(res.body.decisionOutcome).toBe('approved');
    expect(res.body.decisionReason).toBeTruthy();
  });

  it(
    'should return 409 when calling decide on already-decided permit',
    async () => {
      await request(app.getHttpServer())
        .post(`/permits/${permitId}/actions/decide`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          outcome: 'rejected',
          decisionReason:
            'This should fail because permit is already approved not under_review.',
        })
        .expect(409);
    },
  );

  // ── Test: Input validation ─────────────────────────────────────────────

  it(
    'should return 400 for invalid outcome value in decide',
    async () => {
      // Create a second permit for validation test
      const secondPermitId = await createAndSubmitPermit(applicantToken);
      await request(app.getHttpServer())
        .post(`/permits/${secondPermitId}/actions/begin-review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/permits/${secondPermitId}/actions/decide`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({
          outcome: 'pending', // invalid value
          decisionReason: 'This should fail validation.',
        })
        .expect(400);
    },
    30000,
  );

  it(
    'should return 400 for missing infoRequestNote in request-info',
    async () => {
      // Need a permit in under_review status
      const thirdPermitId = await createAndSubmitPermit(applicantToken);
      await request(app.getHttpServer())
        .post(`/permits/${thirdPermitId}/actions/begin-review`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/permits/${thirdPermitId}/actions/request-info`)
        .set('Authorization', `Bearer ${reviewerToken}`)
        .send({}) // missing infoRequestNote
        .expect(400);
    },
    30000,
  );
});
