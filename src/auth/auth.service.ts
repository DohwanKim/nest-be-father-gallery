import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(userData: CreateUserDto) {
    let newUser: UserEntity = new UserEntity();
    newUser = { ...newUser, ...userData };
    await this.userRepository.save(newUser);

    return true;
  }
}
