import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, SendVerificationEmail } from './dto';
import * as jwt from 'jsonwebtoken';
import sendEmail from 'src/utils/sendMail';

const { CLIENT_URL } = process.env;
const logger = new Logger();
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async register(dto: CreateUserDto) {
    try {
      const { names, email, password } = dto;
      const user = await this.userRepository.findOne({ email });
      if (user) {
        throw new HttpException(
          { status: HttpStatus.BAD_REQUEST, error: 'User already exists' },
          HttpStatus.BAD_REQUEST,
        );
      }
      const newUser = this.userRepository.create({
        names,
        email,
        password,
      });
      await newUser.save();
      const activation_token = createActivationToken({ id_user: newUser.id });
      const url = `${CLIENT_URL}/user/activate/${activation_token}`;
      sendEmail(email, url, 'Click here');

      return {
        message: 'Please go to your mail and activate your account.',
      };
    } catch (error) {
      return error;
    }
  }
  async sendVerification(dto: SendVerificationEmail) {
    try {
      const { email } = dto;
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      const activation_token = createActivationToken({ id_user: user.id });
      const url = `${CLIENT_URL}/user/activate/${activation_token}`;
      sendEmail(email, url, 'Click here');
      return {
        message: 'Please go to your mail and activate your account.',
      };
    } catch (error) {
      return error;
    }
  }
}

export function createActivationToken(payload) {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: '15m',
  });
}
export function createAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30m',
  });
}
export function createRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
}
export function setUserCookies(time: any, res: any, refresh_token: any) {
  res.cookie('refreshtoken', refresh_token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/user/get_access_token',
    sameSite: 'none',
    secure: true,
  });
}
