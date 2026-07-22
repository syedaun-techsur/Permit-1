import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from '../../app.module';
import * as cookieParser from 'cookie-parser';

/**
 * Notifications integration tests.
 *
 * Requires a running PostgreSQL instance — matches the docker-compose stack.
 * Not run during execute phase; executed by the verifier.
 *
 * Setup:
 *   - Creates reviewer + applicant users
 *   - Submits permit application
 *   - Begins review (which creates a STATUS_CHANGE notification for the applicant)
 *   Then tests GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all
 */
describe('NotificationsController (e2e)', () => {
  let app: INestApplication;
  let applicantToken: string;
  let reviewerToken: string;
  let otherToken: string;
  let permitId: string;
  let notifId: string;

  async function registerUser(email: string, password: string, role: 'applicant' | 'reviewer' = 'applicant') {
    const reg = await supertest(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, fullName: `Test ${role}`, role });
    expect([200, 201]).toContain(reg.status);
  }

  async function loginUser(email: string, password: string): Promise<string> {
    const res = await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    return res.body.accessToken;
  }

  async function createAndSubmitPermit(token: string): Promise<string> {
    const created = await supertest(app.getHttpServer())
      .post('/permits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        permitType: 'construction',
        projectDescription: 'Test project',
        siteAddress: {
          street: '123 Main St',
          city: 'Testville',
          state: 'CA',
          zipCode: '90210',
        },
        contactName: 'Test User',
        contactPhone: '555-1234',
        contactEmail: 'test@example.com',
      });
    expect(created.status).toBe(201);
    const id = created.body.id;

    // Get upload URL and register a document (required for submission)
    const urlRes = await supertest(app.getHttpServer())
      .post(`/permits/${id}/documents/upload-url`)
      .set('Authorization', `Bearer ${token}`)
      .send({ filename: 'test.pdf', mimeType: 'application/pdf', sizeBytes: 1024 });
    expect(urlRes.status).toBe(201);

    await supertest(app.getHttpServer())
      .post(`/permits/${id}/documents`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        storageKey: urlRes.body.storageKey,
      });

    const submitted = await supertest(app.getHttpServer())
      .post(`/permits/${id}/submit`)
      .set('Authorization', `Bearer ${token}`);
    expect(submitted.status).toBe(201);

    return id;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const ts = Date.now();
    const aEmail = `a-notif-${ts}@test.com`;
    const rEmail = `r-notif-${ts}@test.com`;
    const oEmail = `o-notif-${ts}@test.com`;

    await registerUser(aEmail, 'Password123!', 'applicant');
    await registerUser(rEmail, 'Password123!', 'reviewer');
    await registerUser(oEmail, 'Password123!', 'applicant');

    applicantToken = await loginUser(aEmail, 'Password123!');
    reviewerToken = await loginUser(rEmail, 'Password123!');
    otherToken = await loginUser(oEmail, 'Password123!');

    // Create and submit permit as applicant
    permitId = await createAndSubmitPermit(applicantToken);

    // Begin review as reviewer — this creates a STATUS_CHANGE notification for the applicant
    const review = await supertest(app.getHttpServer())
      .post(`/permits/${permitId}/actions/begin-review`)
      .set('Authorization', `Bearer ${reviewerToken}`);
    expect([200, 201]).toContain(review.status);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Test 1: GET /notifications (as applicant) → 200, data array with under-review notification', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    // Save the notification ID for subsequent tests
    notifId = res.body.data[0].id;
    expect(notifId).toBeDefined();
  });

  it('Test 2: PATCH /notifications/:notifId/read → 200; GET /notifications/unread-count → 0', async () => {
    const readRes = await supertest(app.getHttpServer())
      .patch(`/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(readRes.status).toBe(200);

    // Verify unread count drops to 0
    const countRes = await supertest(app.getHttpServer())
      .get('/notifications/unread-count')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(countRes.status).toBe(200);
    expect(countRes.body.unreadCount).toBe(0);
  });

  it('Test 3: PATCH /notifications/read-all → 200', async () => {
    const res = await supertest(app.getHttpServer())
      .patch('/notifications/read-all')
      .set('Authorization', `Bearer ${applicantToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('updated');
    expect(typeof res.body.updated).toBe('number');
  });

  it('Test 4: GET /notifications (as other user) → 200 with empty data (no cross-user leakage)', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    // Other user has no notifications related to this permit
    expect(res.body.data).toHaveLength(0);
  });
});
