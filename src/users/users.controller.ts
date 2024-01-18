import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('info')
  @UseGuards(JwtAccessGuard)
  getInfo(@Req() req: any) {
    return this.usersService.getMyInfo(req.user.id);
  }
}
