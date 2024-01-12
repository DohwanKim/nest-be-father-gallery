import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUserDecorator } from './get-user.decorator';
import { UserEntity } from './entity/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @Post('/signin')
  async signIn(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signIn(createUserDto);
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  async test(@GetUserDecorator() user: UserEntity) {
    console.log('req', user);
  }
}
