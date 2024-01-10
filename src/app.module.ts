import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './posts/entitiy/post.entity';
import { ImagesModule } from './images/images.module';
import { ImageEntity } from './images/entitiy/image.entitiy';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [PostEntity, ImageEntity],
      synchronize: process.env.NODE_ENV === 'dev',
    }),
    PostsModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
