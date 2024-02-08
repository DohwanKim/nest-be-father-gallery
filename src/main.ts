import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Father Gallery')
    .setDescription('Father Gallery API description')
    .setVersion('1.0')
    .addTag('father-gallery')
    .build();

  app.enableCors({
    origin: ['http://localhost:3001'],
    credentials: true,
    exposedHeaders: ['Authorization', 'accessToken', 'refreshToken'],
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
  logger.log(`Application listening on port 3000`);
}
bootstrap().then(() => {});
