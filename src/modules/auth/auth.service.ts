import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import {
  ActivateAccount,
  CreateUserDto,
  Login,
  SendVerificationEmail,
} from './dto';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
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
  async activateAccount(dto: ActivateAccount) {
    try {
      const data = jwt.verify(
        dto.activation_token,
        process.env.ACTIVATION_TOKEN_SECRET,
      );
      const { id_user } = data;
      const user = await this.userRepository.findOne({ id: id_user });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (user.is_enabled === true) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_MODIFIED,
            error: 'User is already activated',
          },
          HttpStatus.NOT_MODIFIED,
        );
      }
      user.is_enabled = true;
      await user.save();
      return {
        message: 'Account activated',
      };
    } catch (error) {
      return error;
    }
  }
  async login(dto: Login, req: any) {
    try {
      const { email, password } = dto;
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      // Verify if user account is activated
      if (user.is_enabled === false) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Please activate your account first.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new HttpException(
          { status: HttpStatus.FORBIDDEN, error: 'Wrong password' },
          HttpStatus.FORBIDDEN,
        );
      }

      //Setting cookies to request access_token
      const refresh_token = createRefreshToken({ id: user.id });
      req.res.setHeader('Access-Control-Allow-Credentials', 'true');
      req.res.setHeader(
        'Access-Control-Allow-Headers',
        'Cookie,Set-Cookie,Accept,Content-Type',
      );
      const cookie_expire = 7 * 24 * 60 * 60 * 1000;
      setUserCookies(cookie_expire, req.res, refresh_token);

      // return access_token
      const access_token = createAccessToken({ id: user.id });
      return {
        message: 'Login success',
        access_token,
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
