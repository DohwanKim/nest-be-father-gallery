import { Test, TestingModule } from '@nestjs/testing';
import { FilterOptions, PostsService } from './posts.service';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { DataSource, Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { ArtType } from '../constants/post.enum';
import { ImagesService } from '../images/images.service';
import { ImageEntity } from '../images/entity/image.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockDataSource = Partial<Record<keyof DataSource, jest.Mock>>;
type MockImagesService = Partial<Record<keyof ImagesService, jest.Mock>>;

const mockPostsRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnThis(),
};
const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnThis(),
};
const mockImagesService = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
};

jest.mock('nestjs-typeorm-paginate');

describe('PostsService', () => {
  let postsService: PostsService;
  let postsRepository: MockRepository<PostEntity>;
  let dataSource: MockDataSource;
  let imagesService: MockImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockPostsRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
        {
          provide: ImagesService,
          useValue: mockImagesService,
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postsRepository = module.get(getRepositoryToken(PostEntity));
    dataSource = module.get(getDataSourceToken());
    imagesService = module.get(ImagesService);
  });

  it('should be defined', () => {
    expect(postsService).toBeDefined();
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

      const result = await postsService.getPostListPaginateWithFilter(
        paginationOptions,
        filterOptions,
      );

      expect(mockPostsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'post',
      );
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
      expect(await postsService.getOnePost(1)).toEqual(result);
    });

    it('should throw NotFoundException 400 error', async () => {
      postsRepository.findOne.mockReturnValue(undefined);
      try {
        await postsService.getOnePost(999);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const postData = {
        title: 'init title',
        drawingDate: new Date(),
        artType: 'NONE' as ArtType,
        canvasSize: '100x100',
        price: 100,
        frameType: '도화지',
        contents: '게시글',
        isSold: false,
        tags: [],
        img: null,
      };

      postsRepository.create.mockReturnValue(postData);
      postsRepository.save.mockReturnValue(postData);

      const result = await postsService.createPost(postData);
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
        img: { id: 'beforeUrl' } as ImageEntity,
      };
      const updateData = {
        title: 'update title',
        artType: 'NONE' as ArtType,
        canvasSize: '100x100',
        price: 100,
        frameType: '도화지',
        contents: '게시글',
        tags: [],
        img: { id: 'updateUrl' } as ImageEntity,
      };

      postsRepository.findOne.mockReturnValue(postData);
      postsRepository.save.mockReturnValue(updateData);

      const result = await postsService.updatePost(1, updateData);
      expect(result).toEqual(true);
      expect(imagesService.deleteImage).toHaveBeenCalledWith('beforeUrl');
      jest.clearAllMocks();
    });

    it('should throw 400 error', async () => {
      const id = 999;

      postsRepository.findOne.mockReturnValue(undefined);
      try {
        await postsService.updatePost(id, {});
      } catch (e) {
        expect(e.response.message).toEqual(`Post id ${id} not found`);
      }
    });
  });

  describe('deletePost', () => {
    let mockQueryRunner;

    beforeEach(() => {
      mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          getRepository: jest.fn(() => ({
            delete: jest.fn(),
          })),
        },
        commitTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
      };
      jest
        .spyOn(dataSource, 'createQueryRunner')
        .mockReturnValue(mockQueryRunner);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should delete posts and return true for each deleted post', async () => {
      const ids = [1, 2];
      const results = [true, true];

      mockQueryRunner.manager.getRepository.mockReturnValue({
        delete: jest.fn().mockReturnValue({ affected: 1 }),
      });
      postsRepository.findOne.mockReturnValue({
        img: { id: 'deletedImageId' },
      });

      const queryRunner = dataSource.createQueryRunner();
      expect(await postsService.deletePosts(ids)).toEqual(results);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(imagesService.deleteImage).toHaveBeenCalledTimes(ids.length);
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should throw an error if a post is not found', async () => {
      const ids = [1, 2];
      postsRepository.findOne.mockReturnValue(undefined);

      const queryRunner = dataSource.createQueryRunner();
      try {
        await postsService.deletePosts(ids);
      } catch (e) {
        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(e.response.message).toEqual(`Post id ${ids[0]} not found`);
        expect(imagesService.deleteImage).toHaveBeenCalledTimes(0);
      }
    });

    it('should throw an error if queryRunner delete not work', async () => {
      const ids = [1];

      mockQueryRunner.manager.getRepository.mockReturnValue({
        delete: jest.fn().mockReturnValue({ affected: 0 }),
      });
      postsRepository.findOne.mockReturnValue({
        img: { id: 'deletedImageId' },
      });

      const queryRunner = dataSource.createQueryRunner();
      try {
        await postsService.deletePosts(ids);
      } catch (e) {
        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(e.response.message).toEqual(`Post ${ids[0]} has not found`);
        expect(imagesService.deleteImage).toHaveBeenCalledTimes(0);
      }
    });
  });
});
