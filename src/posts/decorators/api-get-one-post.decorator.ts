import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const ApiGetOnePostDecorator = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: '게시글 데이터 리스트와 페이지네이션 데이터',
      schema: {
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
    }),
  );
};
