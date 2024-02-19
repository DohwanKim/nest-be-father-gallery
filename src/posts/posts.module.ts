import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { AuthModule } from '../auth/auth.module';
import { ImagesService } from '../images/images.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), AuthModule],
  controllers: [PostsController],
  providers: [PostsService, ImagesService],
})
export class PostsModule {}
