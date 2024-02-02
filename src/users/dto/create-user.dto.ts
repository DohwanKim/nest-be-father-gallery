import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
  @MinLength(8)
  @MaxLength(20)
  @Matches(
    /^(?=.*[a-z]?)(?=.*[A-Z]?)(?=.*\d?)(?=.*[@$!%*#?&]?)[A-Za-z\d@$!%*#?&]{8,20}$/,
    {
      message:
        '비밀번호는 대/소문자, 숫자, 특수문자 중 2개를 포함, 8-20자 사이여야 합니다.',
    },
  )
  password: string;
}
