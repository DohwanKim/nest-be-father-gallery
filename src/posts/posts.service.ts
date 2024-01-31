import { Injectable, NotFoundException } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  paginate,
  IPaginationOptions,
  Pagination,
} from 'nestjs-typeorm-paginate';

export type SortOptions = 'ASC' | 'DESC';
export type FilterOptions = {
  title?: string;
  tags?: string[];
  sort?: SortOptions;
  artTypes?: string[];
};

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
  ) {}

  async getPostListPaginateWithFilter(
    paginationOptions: IPaginationOptions,
    filterOptions: FilterOptions,
  ): Promise<Pagination<PostEntity>> {
    const queryBuilder = this.postsRepository.createQueryBuilder('post');

    if (filterOptions.title) {
      queryBuilder.andWhere('post.title like :title', {
        title: `%${filterOptions.title}%`,
      });
    }
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      queryBuilder.andWhere('post.tags && :tags', { tags: filterOptions.tags });
    }
    if (filterOptions.sort) {
      queryBuilder.orderBy('post.createAt', filterOptions.sort);
    }
    if (filterOptions.artTypes && filterOptions.artTypes.length > 0) {
      queryBuilder.andWhere('post.artType IN (:...artTypes)', {
        artTypes: filterOptions.artTypes,
      });
    }

    return paginate<PostEntity>(queryBuilder, paginationOptions);
  }

  async getOnePost(id: number): Promise<PostEntity> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post id ${id} not found`);
    return post;
  }

  async createPost(postData: CreatePostDto) {
    const newPost = this.postsRepository.create(postData);
    return await this.postsRepository.save(newPost);
  }

  async updatePost(id: number, updateData: UpdatePostDto) {
    const target = await this.getOnePost(id);
    const updated = { ...target, ...updateData };
    await this.postsRepository.save(updated);
    return true;
  }

  async deletePost(id: number) {
    const result = await this.postsRepository.delete({ id });
    if (result.affected === 0)
      throw new NotFoundException(`Post id ${id} not found`);
    return true;
  }
}
