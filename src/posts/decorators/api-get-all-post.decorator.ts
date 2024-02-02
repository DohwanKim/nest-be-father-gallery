import { applyDecorators } from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

export const ApiGetAllPostDecorator = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      type: Number,
      description: '페이지 넘버',
      required: false,
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      description: '각 페이지 아이템 개수 (max: 100)',
      required: false,
    }),
    ApiQuery({
      name: 'title',
      type: String,
      description: '검색할 제목',
      required: false,
    }),
    ApiQuery({
      name: 'sort',
      enum: ['ASC', 'DESC'],
      enumName: 'SortOptions',
      description: '정렬 방식 (기본값: DESC)',
      required: false,
    }),
    ApiQuery({
      name: 'tags',
      isArray: true,
      type: [String],
      required: false,
    }),
    ApiQuery({
      name: 'artTypes',
      enumName: 'artTypes',
      description: '정렬 방식 (기본값: DESC)',
      type: [String],
      enum: [
        'NONE',
        'WATERCOLOR',
        'PENCIL_DRAWING',
        'ACRYLIC_PAINTING',
        'OIL_PAINTING',
      ],
      required: false,
    }),
    ApiResponse({
      status: 200,
      description: '게시글 데이터 리스트와 페이지네이션 데이터',
      schema: {
        properties: {
          items: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number' },
                createAt: { default: '2024-01-31T10:39:33.579Z' },
                updateAt: { default: '2024-01-31T10:39:33.579Z' },
                version: { type: 'number' },
                title: { type: 'string' },
                artType: {
                  type: 'string',
                  enum: [
                    'NONE',
                    'WATERCOLOR',
                    'PENCIL_DRAWING',
                    'ACRYLIC_PAINTING',
                    'OIL_PAINTING',
                  ],
                },
                canvasSize: { type: 'string' },
                price: { type: 'number' },
                frameType: { type: 'string' },
                contents: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                img: { type: 'null' },
              },
            },
          },
          meta: {
            properties: {
              itemCount: { type: 'number' },
              totalItems: { type: 'number' },
              itemsPerPage: { type: 'number' },
              totalPages: { type: 'number' },
              currentPage: { type: 'number' },
            },
          },
          links: {
            properties: {
              first: { type: 'string' },
              previous: { type: 'string' },
              next: { type: 'string' },
              last: { type: 'string' },
            },
          },
        },
      },
    }),
  );
};
