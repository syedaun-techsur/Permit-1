import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';

/**
 * Messaging integration tests.
 *
 * Requires a running PostgreSQL (and MinIO) instance — matches the docker-compose
 * stack defined in the repo. Not run during execute phase; executed by the verifier.
 *
 * Setup:
 *   - Creates applicant + reviewer users
 *   - Creates + submits a permit application
 *   - Assigns reviewer via begin-review
 *   Then tests the messaging endpoints.
 */
describe('MessagesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let applicantToken: string;
  let reviewerToken: string;
  let permitId: string;
  let messageId: string;

  const BASE_URL = 'http://localhost:3000';

  async function registerUser(email: string, password: string, role: 'applicant' | 'reviewer' = 'applicant') {
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, fullName: `Test ${role}`, role });
    expect(reg.status).toBe(201);
    return reg.body;
  }

  async function loginUser(email: string, password: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    return res.body.accessToken;
  }

  async function createAndSubmitPermit(token: string): Promise<string> {
    // Create draft
    const created = await request(app.getHttpServer())
      .post('/permits')
      .set('Authorization', `Bearer ${token}`)
      .send({
        permitType: 'construction',
        projectDescription: 'Test project for messaging',
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

    // Upload a document (required for submission)
    // Get upload URL
    const urlRes = await request(app.getHttpServer())
      .post(`/permits/${id}/documents/upload-url`)
      .set('Authorization', `Bearer ${token}`)
      .send({ filename: 'test.pdf', mimeType: 'application/pdf', sizeBytes: 1024 });
    expect(urlRes.status).toBe(201);

    // Register document
    await request(app.getHttpServer())
      .post(`/permits/${id}/documents`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        storageKey: urlRes.body.storageKey,
      });

    // Submit
    const submitted = await request(app.getHttpServer())
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

    dataSource = app.get(DataSource);

    // Setup: register users
    await registerUser(`applicant-msg-${Date.now()}@test.com`, 'Password123!', 'applicant');
    await registerUser(`reviewer-msg-${Date.now()}@test.com`, 'Password123!', 'reviewer');

    const applicantEmail = `applicant-msg-${Date.now()}@test.com`;
    const reviewerEmail = `reviewer-msg-${Date.now()}@test.com`;

    // Use unique emails per test run
    const ts = Date.now();
    const aEmail = `a-msg-${ts}@test.com`;
    const rEmail = `r-msg-${ts}@test.com`;

    await registerUser(aEmail, 'Password123!', 'applicant');
    await registerUser(rEmail, 'Password123!', 'reviewer');

    applicantToken = await loginUser(aEmail, 'Password123!');
    reviewerToken = await loginUser(rEmail, 'Password123!');

    // Create and submit permit as applicant
    permitId = await createAndSubmitPermit(applicantToken);

    // Begin review as reviewer
    const review = await request(app.getHttpServer())
      .post(`/permits/${permitId}/actions/begin-review`)
      .set('Authorization', `Bearer ${reviewerToken}`);
    expect([200, 201]).toContain(review.status);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Test 1: POST /permits/:id/messages as applicant → 201, MessageObject with senderRole=applicant', async () => {
    const res = await request(app.getHttpServer())
      .post(`/permits/${permitId}/messages`)
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({ body: 'Hello, can you review my application?' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      applicationId: permitId,
      body: 'Hello, can you review my application?',
      senderRole: 'applicant',
    });
    expect(res.body.senderName).toBeDefined();
    expect(res.body.sentAt).toBeDefined();
    expect(Array.isArray(res.body.attachments)).toBe(true);
    expect(Array.isArray(res.body.readBy)).toBe(true);

    messageId = res.body.id;
  });

  it('Test 2: GET /permits/:id/messages → 200, array includes the message just sent', async () => {
    const res = await request(app.getHttpServer())
      .get(`/permits/${permitId}/messages`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const found = res.body.data.find((m: { id: string }) => m.id === messageId);
    expect(found).toBeDefined();
  });

  it('Test 3: GET /permits/:id/messages/unread-count (as reviewer) → { unreadCount: 1 }', async () => {
    const res = await request(app.getHttpServer())
      .get(`/permits/${permitId}/messages/unread-count`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it('Test 4: POST /permits/:id/messages/:msgId/read → 200; re-check unreadCount → 0', async () => {
    const readRes = await request(app.getHttpServer())
      .post(`/permits/${permitId}/messages/${messageId}/read`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(readRes.status).toBe(200);

    // Re-check unread count
    const countRes = await request(app.getHttpServer())
      .get(`/permits/${permitId}/messages/unread-count`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(countRes.status).toBe(200);
    expect(countRes.body.unreadCount).toBe(0);
  });

  it('Test 5: POST message on draft application → 403', async () => {
    // Create a new draft permit (not submitted)
    const draft = await request(app.getHttpServer())
      .post('/permits')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({
        permitType: 'construction',
        projectDescription: 'Draft permit',
        siteAddress: {
          street: '456 Draft Ave',
          city: 'Draftville',
          state: 'CA',
          zipCode: '90211',
        },
        contactName: 'Draft User',
        contactPhone: '555-5678',
        contactEmail: 'draft@example.com',
      });

    expect(draft.status).toBe(201);
    const draftId = draft.body.id;

    const res = await request(app.getHttpServer())
      .post(`/permits/${draftId}/messages`)
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({ body: 'Test message on draft' });

    expect(res.status).toBe(403);
  });

  it('Test 6: POST attachment upload-url as applicant → 403', async () => {
    const res = await request(app.getHttpServer())
      .post(`/permits/${permitId}/messages/${messageId}/attachments/upload-url`)
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({ filename: 'test.pdf', mimeType: 'application/pdf', sizeBytes: 1024 });

    expect(res.status).toBe(403);
  });
});
