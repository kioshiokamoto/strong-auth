import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ResetPassword {
  @ApiProperty({
    description: 'Contraseña de usuario',
    example: '123456',
    minLength: 6,
    type: String,
  })
  @Length(6, 255, { message: 'Contraseña debe tener al menos 6 caracteres' })
  @IsString()
  password: string;
}
