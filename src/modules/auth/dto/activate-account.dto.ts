import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
export class ActivateAccount {
  @ApiProperty({
    description: 'Activation token',
    example: '+NfexampleLs~_ej7qE+pfz}3+NfLs~_ej7qE+pfz}3+NfLs~_ej7qE+pfz}3',
    type: String,
  })
  @Length(3, 500, { message: 'You must enter a valid token' })
  @IsString()
  activation_token: string;
}
