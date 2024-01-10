import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from './entity/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity]), HttpModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
