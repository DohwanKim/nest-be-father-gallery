import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('info')
  @ApiOperation({ summary: '내 정보 가져오기' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        id: {
          type: 'number',
          description: '유저 고유 아이디',
          example: 1,
        },
        username: {
          type: 'string',
          description: '유저 아이디',
          example: 'username',
        },
        role: {
          type: 'string',
          description: '유저 권한',
          enum: ['ADMIN', 'MANAGER', 'USER'],
        },
      },
    },
    description: '유저 정보 가져오기',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  getInfo(@Req() req: any) {
    return this.usersService.getMyInfo(req.user.id);
  }
}
