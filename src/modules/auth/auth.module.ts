import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/auth/reset-password',
        method: RequestMethod.POST,
      },
      {
        path: '/auth/disable-account',
        method: RequestMethod.GET,
      },
      {
        path: '/auth/info',
        method: RequestMethod.GET,
      },
      {
        path: '/auth/update',
        method: RequestMethod.ALL,
      },
    );
  }
}
