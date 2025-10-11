import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestSetup } from './config/test-setup';

describe('AppController (e2e)', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'Password1234!',
    name: 'Test User',
  };

  it('/auth/register (POST)', () => {
    return request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe('test@example.com');
        expect(res.body.name).toBe('Test User');
        expect(res.body).not.toHaveProperty('password');
      });
  });

  it('/auth/register (POST) - duplicate email', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    return await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('/auth/login (POST)', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    return request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
