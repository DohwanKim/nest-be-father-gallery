import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { mockAuthGuard } from './mock-auth-guard';
import { JwtAccessGuard } from '../src/auth/guards/jwt-access.guard';
import * as request from 'supertest';
import { CreatePostDto } from '../src/posts/dto/create-post.dto';
import * as cookieParser from 'cookie-parser';
import { ArtType } from '../src/constants/post.enum';

type postType = {
  id: number;
  createAt: Date;
  updateAt: Date;
  version: number;
  title: string;
  artType: ArtType;
  canvasSize: string;
  price: number;
  frameType: string;
  contents: string;
  tags: string[];
  img: null | object;
};

const testUser = {
  username: 'testuser',
  password: 'Testpass123!',
};

const testPost: CreatePostDto = {
  title: 'test post',
  artType: 'NONE' as ArtType,
  canvasSize: '100x100',
  price: 10000,
  frameType: 'big canvas',
  tags: ['test', 'test2'],
  contents: 'Test Content',
  img: null,
};

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let newPostId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAccessGuard)
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
    await request(app.getHttpServer()).post('/auth/signup').send({
      username: testUser.username,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /posts', () => {
    it('should return 201', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send(testPost)
        .expect(201);
    });

    it('should return 400 (less data)', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ ...testPost, title: undefined })
        .expect(400);
    });

    it('should return 400 (more bad data)', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ ...testPost, bad: 'bad' })
        .expect(400);
    });
  });

  describe('GET /posts', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .send({
          ...testPost,
          title: 'filterTitle',
          artType: 'ACRYLIC_PAINTING',
        });
      await request(app.getHttpServer())
        .post('/posts')
        .send({
          ...testPost,
          title: 'other1',
          artType: 'WATERCOLOR',
          tags: ['other1'],
        });
      await request(app.getHttpServer())
        .post('/posts')
        .send({
          ...testPost,
          title: 'other1',
          artType: 'PENCIL_DRAWING',
          tags: ['other1', 'other2'],
        });
      await request(app.getHttpServer())
        .post('/posts')
        .send({
          ...testPost,
          title: 'other1',
          artType: 'OIL_PAINTING',
          tags: ['other1', 'other2', 'other3'],
        });

      return true;
    });

    it('should return 200', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          const { items } = res.body;

          expect(items).toBeInstanceOf(Array);
          expect(items[items.length - 1]).toEqual(
            expect.objectContaining(testPost),
          );
          newPostId = items[items.length - 1].id;
        });
    });

    it('should return posts with specified title', () => {
      return request(app.getHttpServer())
        .get('/posts?title=filter')
        .expect(200)
        .expect((res) => {
          const { items } = res.body;

          expect(items).toBeInstanceOf(Array);
          expect(items.length).toBe(1);
          items.forEach((item: postType) => {
            expect(item.title).toContain('filter');
          });
        });
    });

    it('should return posts with specified artType', () => {
      return request(app.getHttpServer())
        .get('/posts?artTypes=WATERCOLOR')
        .expect(200)
        .expect((res) => {
          const { items } = res.body;

          expect(items).toBeInstanceOf(Array);
          expect(items.length).toBe(1);
          items.forEach((item: postType) => {
            expect(item.artType).toBe('WATERCOLOR');
          });
        });
    });

    it('should return posts with specified tags', () => {
      return request(app.getHttpServer())
        .get('/posts?tags=other1')
        .expect(200)
        .expect((res) => {
          const { items } = res.body;

          expect(items).toBeInstanceOf(Array);
          expect(items.length).toBe(3);
          items.forEach((item: postType) => {
            expect(item.tags).toContain('other1');
          });
        });
    });
  });

  describe('GET /posts/:id', () => {
    it('should return 200', () => {
      return request(app.getHttpServer())
        .get(`/posts/${newPostId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(expect.objectContaining(testPost));
        });
    });

    it('should return 404', () => {
      return request(app.getHttpServer()).get(`/posts/999`).expect(404);
    });
  });

  describe('PATCH /posts/:id', () => {
    const updateData = { title: 'Updated Test Post' };

    it('should return 200', () => {
      return request(app.getHttpServer())
        .patch(`/posts/${newPostId}`)
        .send(updateData)
        .expect(200)
        .expect(() => {
          request(app.getHttpServer())
            .get(`/posts/${newPostId}`)
            .then((res) => {
              expect(res.body.title).toEqual('Updated Test Post');
            });
        });
    });

    it('should return 400', () => {
      return request(app.getHttpServer())
        .patch(`/posts/${newPostId}`)
        .send({ bad: 'bad' })
        .expect(400);
    });

    it('should return 404', () => {
      return request(app.getHttpServer())
        .patch(`/posts/999`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should return 200', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${newPostId}`)
        .expect(200);
    });

    it('should return 404', () => {
      return request(app.getHttpServer()).delete(`/posts/999`).expect(404);
    });
  });
});
