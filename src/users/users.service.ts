import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ErrorMessages } from '../constants/error-messages.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(userData: CreateUserDto) {
    const newUser: UserEntity = this.userRepository.create(userData);

    try {
      return await this.userRepository.save(newUser);
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException('User already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findOneByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException(ErrorMessages.INVALID_ID);
    return user;
  }

  async findOneById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`id "${id}" is not found`);
    return user;
  }

  async setUserCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: number) {
    return this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
    const user = await this.findOneById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    return isRefreshTokenMatching ? user : null;
  }

  async getMyInfo(id: number) {
    const { username, role } = await this.findOneById(id);

    return {
      id,
      username,
      role,
    };
  }
}
