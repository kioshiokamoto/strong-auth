import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import User from 'src/entity/user.entity';
import sendEmail from 'src/utils/sendMail';
import { Repository } from 'typeorm';
import {
  ActivateAccount,
  CreateUserDto,
  Login,
  ResetPassword,
  SendEmail,
  UpdateUser,
} from './dto';

const { CLIENT_URL } = process.env;
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
  async sendVerification(dto: SendEmail) {
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
  async getAccessToken(req: any) {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Please login first',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const access_token = jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) {
            throw new HttpException(
              {
                status: HttpStatus.UNAUTHORIZED,
                error: 'Please login first',
              },
              HttpStatus.UNAUTHORIZED,
            );
          }
          return createAccessToken({ id: user.id });
        },
      );
      return { access_token };
    } catch (error) {
      return error;
    }
  }
  async forgotPassword(dto: SendEmail) {
    try {
      const { email } = dto;
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      const access_token = createAccessToken({ id: user.id });
      const url = `${CLIENT_URL}/user/reset/${access_token}`;
      sendEmail(email, url, 'Reset here');
      return {
        message: 'Please go to your mail and reset your password',
      };
    } catch (error) {
      return error;
    }
  }
  async resetPassword(dto: ResetPassword, req: any) {
    try {
      const { password } = dto;
      const user = await this.userRepository.findOne({ id: req?.user.id });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      const passwordHash = await bcrypt.hash(password, 6);
      user.password = passwordHash;
      await user.save();
      return {
        message: 'Password has been updated',
      };
    } catch (error) {
      return error;
    }
  }
  async disableAccount(req: any) {
    try {
      const user = await this.userRepository.findOne({ id: req?.user.id });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (user.is_enabled === false) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Please activate your account first.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      user.is_enabled = false;
      await user.save();

      // Delete cookies
      req.res.setHeader('Access-Control-Allow-Credentials', 'true');
      req.res.setHeader(
        'Access-Control-Allow-Headers',
        'Cookie,Set-Cookie,Accept,Content-Type',
      );

      setUserCookies(10, req.res, '');
      return {
        message: 'Account disabled successfully',
      };
    } catch (error) {
      return error;
    }
  }
  async logout(req: any) {
    try {
      req.res.setHeader('Access-Control-Allow-Credentials', 'true');
      req.res.setHeader(
        'Access-Control-Allow-Headers',
        'Cookie,Set-Cookie,Accept,Content-Type',
      );

      setUserCookies(10, req.res, '');

      return {
        message: 'Logged out, see you',
      };
    } catch (error) {
      return error;
    }
  }
  async getUserInfo(req) {
    try {
      const user = await this.userRepository.findOne({ id: req?.user.id });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (user.is_enabled === false) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Please activate your account first.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return user;
    } catch (error) {
      return error;
    }
  }
  async updateUser(dto: UpdateUser, req: any) {
    try {
      const { names, avatar } = dto;
      if (Object.keys(dto).length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'You must submit at least one field',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepository.findOne({ id: req.user.id });
      if (!user) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'User does not exists' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (user.is_enabled === false) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Please activate your account first.',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (names) {
        user.names = names;
      }
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
      return {
        message: 'User updated successfully',
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
    path: '/api/auth/get-access-token',
    sameSite: 'none',
    secure: true,
  });
}
