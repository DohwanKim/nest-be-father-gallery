import { Test, TestingModule } from '@nestjs/testing';
import { FilterOptions, PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArtType, PostEntity } from './entity/post.entity';
import { Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

jest.mock('nestjs-typeorm-paginate');

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: MockRepository<PostEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepository = module.get(getRepositoryToken(PostEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPost', () => {
    it('should return an array of posts', async () => {
      const expectedResult = [
        {
          id: 1,
          createAt: '2024-01-18T08:56:02.721Z',
          updateAt: '2024-01-18T08:56:02.721Z',
          version: 2,
          title: 'title',
          artType: 'NONE' as ArtType,
          canvasSize: '100x100',
          price: 100,
          frameType: '도화지',
          contents: '게시글',
          tags: ['tag'],
          img: null,
        },
      ];
      const paginationOptions = {
        page: 1,
        limit: 10,
        route: 'http://localhost:3000/posts',
      };
      const filterOptions: FilterOptions = {
        title: 'title',
        tags: ['tag'],
        sort: 'DESC',
        artTypes: ['NONE'],
      };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      };

      jest
        .spyOn(postsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);
      (paginate as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.getPostListPaginateWithFilter(
        paginationOptions,
        filterOptions,
      );

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('post');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'post.img',
        'img',
      );
      expect(result).toMatchObject(expectedResult);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
    });
  });

  describe('getOnePost', () => {
    it('should return a post', async () => {
      const result = {
        id: 1,
        createAt: '2024-01-18T08:56:02.721Z',
        updateAt: '2024-01-18T08:56:02.721Z',
        version: 2,
        title: 'init title',
        artType: 'NONE' as ArtType,
        canvasSize: '100x100',
        price: 100,
        frameType: '도화지',
        contents: '게시글',
        tags: [],
        img: null,
      };

      postsRepository.findOne.mockReturnValue(result);
      expect(await service.getOnePost(1)).toEqual(result);
    });

    it('should throw NotFoundException 400 error', async () => {
      postsRepository.findOne.mockReturnValue(undefined);
      try {
        await service.getOnePost(999);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const postData = {
        title: 'init title',
        artType: 'NONE' as ArtType,
        canvasSize: '100x100',
        price: 100,
        frameType: '도화지',
        contents: '게시글',
        tags: [],
        img: null,
      };

      postsRepository.create.mockReturnValue(postData);
      postsRepository.save.mockReturnValue(postData);

      const result = await service.createPost(postData);
      expect(result).toEqual(postData);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const postData = {
        title: 'init title',
        artType: 'NONE' as ArtType,
        canvasSize: '100x100',
        price: 100,
        frameType: '도화지',
        contents: '게시글',
        tags: [],
        img: null,
      };
      const updateData = {
        title: 'update title',
        artType: 'NONE' as ArtType,
        canvasSize: '100x100',
        price: 100,
        frameType: '도화지',
        contents: '게시글',
        tags: [],
        img: null,
      };

      postsRepository.findOne.mockReturnValue(postData);
      postsRepository.save.mockReturnValue(updateData);

      const result = await service.updatePost(1, updateData);
      expect(result).toEqual(true);
    });

    it('should throw 400 error', async () => {
      const id = 999;

      postsRepository.findOne.mockReturnValue(undefined);
      try {
        await service.updatePost(id, {});
      } catch (e) {
        expect(e.response.message).toEqual(`Post id ${id} not found`);
      }
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      postsRepository.delete.mockReturnValue({ affected: 1 });
      const result = await service.deletePost(1);
      expect(result).toEqual(true);
    });

    it('should throw NotFoundException 400 error', async () => {
      const id = 999;

      postsRepository.delete.mockReturnValue({ affected: 0 });
      try {
        await service.deletePost(id);
      } catch (e) {
        expect(e.response.message).toEqual(`Post id ${id} not found`);
      }
    });
  });
});
