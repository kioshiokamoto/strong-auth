import { Injectable, NestMiddleware } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    try {
      const token = req.header('Authorization').split('Bearer ')[1];
      if (!token) {
        return res.status(400).json({ message: 'invalid authentication' });
      }
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ message: 'invalid authentication' });

        req.user = user;
        next();
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
