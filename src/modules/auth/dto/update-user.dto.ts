import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUser {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    type: String,
    required: false,
  })
  @Length(3, 255, { message: 'name must be at least 3 characters' })
  @IsString()
  @IsOptional()
  names: string;

  @ApiProperty({
    description: 'User image',
    example: 'https://christiantola.me/assets/img/nest_logo.d11da205.svg',
    type: String,
    required: false,
  })
  @IsOptional()
  avatar?: string;
}
