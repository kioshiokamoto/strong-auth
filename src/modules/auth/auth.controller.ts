import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ActivateAccount,
  CreateUserDto,
  Login,
  SendVerificationEmail,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/register')
  @ApiOperation({ summary: 'Register a user' })
  @ApiResponse({ status: 201, description: 'Email sended' })
  @ApiResponse({ status: 409, description: 'Something was wrong' })
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('/send-email-verification')
  @ApiOperation({ summary: 'Send email verification' })
  @ApiResponse({ status: 200, description: 'Email sended' })
  sendVerification(@Body() dto: SendVerificationEmail) {
    return this.authService.sendVerification(dto);
  }

  @Post('/activate-account')
  @ApiOperation({ summary: 'Activate user account' })
  activateAccount(@Body() dto: ActivateAccount) {
    return this.authService.activateAccount(dto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login to system' })
  login(@Body() dto: Login, @Req() req) {
    return this.authService.login(dto, req);
  }
}
