import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { NotFoundException } from '@nestjs/common';
import { ArtType } from './entity/post.entity';

const mockService = {
  getAllPost: jest.fn(),
  getOnePost: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

type MockService = Partial<Record<keyof PostsService, jest.Mock>>;

describe('PostsController', () => {
  let controller: PostsController;
  let service: MockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get(PostsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPost', () => {
    it('should return an array', async () => {
      const expectResult = [
        {
          id: 2,
          createAt: '2024-01-18T08:56:02.721Z',
          updateAt: '2024-01-18T08:56:02.721Z',
          version: 2,
          title: 'init title',
          artType: 'NONE',
          canvasSize: '100x100',
          price: 100,
          frameType: '도화지',
          contents: '게시글',
          tags: [],
          img: null,
        },
      ];
      jest.spyOn(service, 'getAllPost').mockImplementation(() => expectResult);

      const result = await service.getAllPost();
      expect(service.getAllPost).toHaveBeenCalled();
      expect(await controller.getAllPost()).toEqual(result);
    });
  });

  describe('getOnePost', () => {
    it('should return a post', async () => {
      const id = 1;
      const expectResult = {
        id,
        createAt: '2024-01-18T08:56:02.721Z',
        updateAt: '2024-01-18T08:56:02.721Z',
        version: 2,
        title: 'init title',
        artType: 'NONE',
        canvasSize: '100x100',
        price: 100,
        frameType: '도화지',
        contents: '게시글',
        tags: [],
        img: null,
      };
      jest.spyOn(service, 'getOnePost').mockImplementation(() => expectResult);

      const result = await service.getOnePost(id);
      service.getOnePost.mockReturnValue(result);
      expect(service.getOnePost).toHaveBeenCalledWith(id);
      expect(await controller.getOnePost(id)).toEqual(result);
    });

    it('should throw NotFoundException if post is not found', async () => {
      const nonExistingId = 999;
      jest
        .spyOn(service, 'getOnePost')
        .mockRejectedValueOnce(
          new NotFoundException(`Post id ${nonExistingId} not found`),
        );

      try {
        await controller.getOnePost(nonExistingId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
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
      jest.spyOn(service, 'createPost').mockImplementation(() => true);
      expect(await controller.createPost(postData)).toBe(true);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const id = 1;
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
      jest.spyOn(service, 'updatePost').mockImplementation(() => true);
      expect(await controller.updatePost(id, updateData)).toBe(true);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const id = 1;
      jest.spyOn(service, 'deletePost').mockImplementation(() => true);
      expect(await controller.deletePost(id)).toBe(true);
    });
  });
});
