import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostEntity } from './entity/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPost(): Promise<PostEntity[]> {
    return this.postsService.getAllPost();
  }

  @Get(':id')
  getOnePost(@Param('id') postId: number): Promise<PostEntity> {
    return this.postsService.getOnePost(postId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createPost(@Body() postData: CreatePostDto): Promise<PostEntity> {
    return this.postsService.createPost(postData);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updatePost(@Param('id') postId: number, @Body() updateData: UpdatePostDto) {
    return this.postsService.updatePost(postId, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deletePost(@Param('id') postId: number) {
    return this.postsService.deletePost(postId);
  }
}
