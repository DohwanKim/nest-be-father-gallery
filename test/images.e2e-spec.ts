import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { mockAuthGuard } from './mock-auth-guard';
import { JwtAccessGuard } from '../src/auth/guards/jwt-access.guard';
import * as request from 'supertest';

const testUser = {
  username: 'testuser',
  password: 'Testpass123!',
};

describe('Images (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAccessGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
    await request(app.getHttpServer()).post('/auth/signup').send({
      username: testUser.username,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Get /get-upload-url', () => {
    it('should return 200 with Cloudflare url', () => {
      return request(app.getHttpServer())
        .get('/images/get-upload-url')
        .expect(200)
        .expect((res) => {
          expect(res.body.uploadUrl).toBeDefined();
        });
    });
  });
});
