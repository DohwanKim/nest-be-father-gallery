import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);
    const newUser = {
      username: signUpDto.username,
      password: hashedPassword,
    };

    await this.userService.createUser(newUser);
  }

  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;
    const user = await this.userService.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken };
    } else {
      return new UnauthorizedException('Please check your login credentials');
    }
  }
}
