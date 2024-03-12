import { Injectable, NotFoundException } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  paginate,
  IPaginationOptions,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { ImagesService } from '../images/images.service';

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
    private dataSource: DataSource,
    private imagesService: ImagesService,
  ) {}

  async getPostListPaginateWithFilter(
    paginationOptions: IPaginationOptions,
    filterOptions: FilterOptions,
  ): Promise<Pagination<PostEntity>> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.img', 'img');

    if (filterOptions.title) {
      queryBuilder.andWhere('post.title like :title', {
        title: `%${filterOptions.title}%`,
      });
    }
    if (filterOptions.tags && filterOptions.tags.length > 0) {
      queryBuilder.andWhere('post.tags && :tags', { tags: filterOptions.tags });
    }
    if (filterOptions.sort) {
      queryBuilder.orderBy('post.drawingDate', filterOptions.sort);
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

  async getRandomPost() {
    return await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.img', 'img')
      .orderBy('RANDOM()')
      .limit(6)
      .getMany();
  }

  async createPost(postData: CreatePostDto) {
    const newPost = this.postsRepository.create(postData);
    return await this.postsRepository.save(newPost);
  }

  async updatePost(id: number, updateData: UpdatePostDto) {
    const target = await this.getOnePost(id);
    const updated = { ...target, ...updateData };

    if (updateData.img && target.img.id !== updateData.img.id) {
      await this.imagesService.deleteImage(target.img.id);
    }

    await this.postsRepository.save(updated);
    return true;
  }

  async deletePosts(ids: number[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    const deletedImageList: string[] = [];

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const results = [];

      for (const id of ids) {
        const target = await this.getOnePost(id);

        if (target) {
          const result = await queryRunner.manager
            .getRepository(PostEntity)
            .delete({ id: target.id });

          if (result.affected === 0) {
            return new NotFoundException(`Post ${id} has not found`);
          }
          results.push(true);
          if (target && target.img && target.img.id) {
            deletedImageList.push(target.img.id);
          }
        }
      }
      await queryRunner.commitTransaction();

      return results;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      if (deletedImageList.length > 0) {
        await Promise.all(
          deletedImageList.map((id) => this.imagesService.deleteImage(id)),
        );
      }

      await queryRunner.release();
    }
  }
}
