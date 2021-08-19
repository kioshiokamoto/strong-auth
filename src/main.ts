import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as rateLimit from 'express-rate-limit';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  //Prefijo
  app.setGlobalPrefix('api');
  //Configuracion de swagger
  const config = new DocumentBuilder()
    .setTitle('Strong auth')
    .setDescription('Auth service with user profile')
    .setVersion('0.0.1')
    .addBearerAuth({ type: 'http', in: 'header' }, 'Authorization')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: `.topbar-wrapper img {content:url(https://next-auth.js.org/img/logo/logo-sm.png); width:50px; height:auto;}
    .swagger-ui .topbar { background-color: #000000; border-bottom: 20px solid #090909; }`,
    customSiteTitle: 'STRONG-AUTH',
  };

  SwaggerModule.setup('/', app, document, customOptions);

  //Configuracion de middlewares y cors
  app
    .use(helmet())
    .use(cookieParser())
    .use(bodyParser.json())
    .use(
      bodyParser.urlencoded({
        extended: true,
      }),
    )
    .use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, //  limitar cada hasta 100 solicitudes por ventana
      }),
    );
  const corsOptions = {
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'X-Access-Token',
      'Authorization',
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000'],
    preflightContinue: false,
  };
  app.enableCors(corsOptions);

  await app.listen(3000);
}
bootstrap();
