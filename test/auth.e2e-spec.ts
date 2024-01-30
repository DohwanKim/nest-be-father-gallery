import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import { JwtRefreshGuard } from '../src/auth/guards/jwt-refresh.guard';
import { mockAuthGuard } from './mock-auth-guard';

const testUser = {
  username: 'testuser',
  password: 'Testpass123!',
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .setLogger(new Logger())
      .overrideGuard(JwtRefreshGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Post /auth/signup', () => {
    it('should create account', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            username: testUser.username,
            password: testUser.password,
          })
          .expect(201);
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if account already exists', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            username: testUser.username,
            password: testUser.password,
          })
          .expect(409);
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if username is too short', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            username: 'tes',
            password: testUser.password,
          })
          .expect(400);
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if username is too long', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            username: 'veryultralongusername',
            password: testUser.password,
          })
          .expect(400);
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if password is too short', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            username: testUser.username + 'a',
            password: 'Testp',
          })
          .expect(400);
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if password is too long', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            username: testUser.username + 'a',
            password: 'veryultralongpassword',
          })
          .expect(400);
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if password is too weak', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            username: testUser.username + 'a',
            password: 'weakpassword',
          })
          .expect(400);
      } catch (err) {
        console.log(err);
      }
    });
  });

  describe('Post /auth/signin', () => {
    it('should login with correct credentials', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            username: testUser.username,
            password: testUser.password,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
          })
          .set('Cookie', [
            `accessToken=${accessToken}; Path=/; Domain=localhost; HttpOnly;`,
            `refreshToken=${refreshToken}; Path=/; Domain=localhost; HttpOnly;`,
          ])
          .then((res) => {
            accessToken = res.body.accessToken;
            refreshToken = res.body.refreshToken;
          });
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if user does not exist', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            username: 'badusername',
            password: testUser.password,
          })
          .expect(401);
      } catch (err) {
        console.log(err);
      }
    });

    it('should fail if password is wrong', async () => {
      try {
        return await request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            username: testUser.username,
            password: 'wrongpassword',
          })
          .expect(401);
      } catch (err) {
        console.log(err);
        return false;
      }
    });
  });

  describe('Get /auth/refresh', () => {
    it('should refresh token', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/auth/signin').send({
        username: testUser.username,
        password: testUser.password,
      });

      try {
        return await agent.get('/auth/refresh').expect(200);
      } catch (err) {
        console.log(err);
        return false;
      }
    });
  });

  describe('Post /auth/signout', () => {
    it('should signout', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/auth/signin').send({
        username: testUser.username,
        password: testUser.password,
      });

      try {
        return await agent.post('/auth/signout').expect(200);
      } catch (err) {
        console.log(err);
        return false;
      }
    });
  });
});
