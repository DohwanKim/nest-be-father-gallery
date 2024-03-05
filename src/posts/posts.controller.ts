import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FilterOptions, PostsService, SortOptions } from './posts.service';
import { PostEntity } from './entity/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiGetAllPostDecorator } from './decorators/api-get-all-post.decorator';
import { ApiGetOnePostDecorator } from './decorators/api-get-one-post.decorator';
import { ArtType } from '../constants/post.enum';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private configService: ConfigService,
  ) {}

  @Get()
  @ApiGetAllPostDecorator()
  getAllPost(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('title') title?: string,
    @Query('sort') sort?: SortOptions,
    @Query(
      'tags',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    tags?: string[],
    @Query(
      'artTypes',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    artTypes?: ArtType[],
  ) {
    const paginationOptions = {
      page,
      limit: limit > 100 ? 100 : limit,
      route: `${this.configService.get('DOMAIN_URL')}/posts`,
    };
    const filterOptions: FilterOptions = {
      title,
      tags,
      sort: sort || 'DESC',
      artTypes,
    };

    return this.postsService.getPostListPaginateWithFilter(
      paginationOptions,
      filterOptions,
    );
  }

  @Get('random-post')
  getRandomPost() {
    return this.postsService.getRandomPost();
  }

  @Get(':id')
  @ApiGetOnePostDecorator()
  getOnePost(@Param('id') postId: number): Promise<PostEntity> {
    return this.postsService.getOnePost(postId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  createPost(@Body() postData: CreatePostDto): Promise<PostEntity> {
    return this.postsService.createPost(postData);
  }

  @Patch(':id')
  @ApiResponse({
    description: '게시글 수정',
    type: Boolean,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  updatePost(@Param('id') postId: number, @Body() updateData: UpdatePostDto) {
    return this.postsService.updatePost(postId, updateData);
  }

  @Delete(':ids')
  @ApiBearerAuth()
  @ApiResponse({
    description: '게시글 삭제',
    type: Boolean,
  })
  @UseGuards(JwtAccessGuard)
  deletePost(
    @Param('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    postIds: number[],
  ) {
    return this.postsService.deletePosts(postIds);
  }
}
