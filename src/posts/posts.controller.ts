import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostEntity } from './entitiy/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * TODO: create, update, delete 는 권한 부여해주기
   */
  @Get()
  getAllPost(): Promise<PostEntity[]> {
    return this.postsService.getAllPost();
  }

  @Get(':id')
  getOnePost(@Param('id') postId: number): Promise<PostEntity> {
    return this.postsService.getOnePost(postId);
  }

  @Post()
  createPost(@Body() postData: CreatePostDto): Promise<PostEntity> {
    return this.postsService.createPost(postData);
  }

  @Patch(':id')
  updatePost(@Param('id') postId: number, @Body() updateData: UpdatePostDto) {
    return this.postsService.updatePost(postId, updateData);
  }

  @Delete(':id')
  deletePost(@Param('id') postId: number) {
    return this.postsService.deletePost(postId);
  }
}
