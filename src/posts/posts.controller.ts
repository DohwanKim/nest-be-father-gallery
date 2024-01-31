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
import { ArtType, PostEntity } from './entity/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { ConfigService } from '@nestjs/config';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private configService: ConfigService,
  ) {}

  /**
   * TODO:
   *  - [x] 페이지네이션을 잘 작동함. 날먹 개꿀
   *  - [x] 문제는 검색 옵션. -> 이름으로 검색, 내용으로 검색, 작성자로 검색, 작성일로 검색 등등 기능 추가 필요
   *  - [] 그리고 테스트 코드 수정해야함
   */
  @Get()
  getAllPost(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('title') title: string,
    @Query('sort') sort: SortOptions = 'DESC',
    @Query(
      'tags',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    tags: string[],
    @Query(
      'artTypes',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    artTypes: ArtType[],
  ) {
    const paginationOptions = {
      page,
      limit: limit > 100 ? 100 : limit,
      route: `${this.configService.get('DOMAIN_URL')}/posts`,
    };
    const filterOptions: FilterOptions = {
      title,
      tags,
      sort,
      artTypes,
    };

    return this.postsService.paginate(paginationOptions, filterOptions);
  }

  @Get(':id')
  getOnePost(@Param('id') postId: number): Promise<PostEntity> {
    return this.postsService.getOnePost(postId);
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  createPost(@Body() postData: CreatePostDto): Promise<PostEntity> {
    return this.postsService.createPost(postData);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard)
  updatePost(@Param('id') postId: number, @Body() updateData: UpdatePostDto) {
    return this.postsService.updatePost(postId, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  deletePost(@Param('id') postId: number) {
    return this.postsService.deletePost(postId);
  }
}
