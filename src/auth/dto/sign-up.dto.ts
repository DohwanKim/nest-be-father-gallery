import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'username',
    description: '사용자 이름',
    required: true,
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'password',
    description:
      '비밀번호 (비밀번호는 대/소문자, 숫자, 특수문자 중 2개를 포함, 8-20자)',
    required: true,
  })
  @IsString()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/, {
    message: '비밀번호는 영문 숫자 특수기호 조합, 8~15자 사이여야 합니다.',
  })
  password: string;
}
