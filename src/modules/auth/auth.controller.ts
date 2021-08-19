import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ActivateAccount,
  CreateUserDto,
  Login,
  ResetPassword,
  SendEmail,
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
  sendVerification(@Body() dto: SendEmail) {
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

  @Get('/get-access-token')
  @ApiOperation({ summary: 'Get access token' })
  getAccessToken(@Req() req) {
    return this.authService.getAccessToken(req);
  }

  @Post('/forgot-password')
  @ApiOperation({ summary: 'Send email to reset password' })
  forgotPassword(@Body() dto: SendEmail) {
    return this.authService.forgotPassword(dto);
  }

  @Post('/reset-password')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Reset your account password ' })
  resetPassword(@Body() dto: ResetPassword, @Req() req) {
    return this.authService.resetPassword(dto, req);
  }
}
