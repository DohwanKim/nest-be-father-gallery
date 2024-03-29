import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from './images/images.module';
import { AuthModule } from './auth/auth.module';
import typeormConfig from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev'
          ? '.env.dev'
          : process.env.NODE_ENV === 'prod'
            ? '.env.prod'
            : '.env.test',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required(),
        DOMAIN_URL: Joi.string().required(),
        DOMAIN: Joi.string().required(),
        DATABASE_TYPE: Joi.string().valid('postgres').required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        ENV_TYPE: Joi.string().valid('dev', 'prod', 'test').required(),
        CLOUDFLARE_IMAGE_ACCOUNT_ID: Joi.string().required(),
        CLOUDFLARE_IMAGE_API_TOKEN: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_ACCESS_TOKEN_MAX_AGE: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_MAX_AGE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeormConfig),
    PostsModule,
    ImagesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
