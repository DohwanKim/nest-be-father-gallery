import { Injectable } from '@nestjs/common';
import { PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
  ) {}

  async getAllPost(): Promise<PostEntity[]> {
    return await this.postsRepository.find();
  }

  async getOnePost(id: number): Promise<PostEntity> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) throw new Error(`Post id ${id} not found`);
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
    if (result.affected === 0) throw new Error(`Post id ${id} not found`);
    return true;
  }
}
