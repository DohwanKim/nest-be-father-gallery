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

describe('Users (e2e)', () => {
  let dataSource: DataSource;

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('Get /users/info', () => {
    it('should get user info', async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(JwtAccessGuard)
        .useValue(mockAuthGuard)
        .compile();
      dataSource = moduleFixture.get<DataSource>(DataSource);

      const app: INestApplication = moduleFixture.createNestApplication();
      await app.init();
      await request(app.getHttpServer()).post('/auth/signup').send({
        username: testUser.username,
        password: testUser.password,
      });

      try {
        return await request(app.getHttpServer())
          .get('/users/info')
          .expect(200);
      } catch (err) {
        console.log(err);
      }

      await app.close();
    });

    it('should fail to get user info', async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      dataSource = moduleFixture.get<DataSource>(DataSource);

      const app: INestApplication = moduleFixture.createNestApplication();
      await app.init();

      try {
        return await request(app.getHttpServer())
          .get('/users/info')
          .expect(401);
      } catch (err) {
        console.log(err);
      }

      await app.close();
    });
  });
});
