import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
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
    .setDescription('Servicio de login/registro')
    .setVersion('0.0.1')
    .setBasePath('api')
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
  await app.listen(3000);
}
bootstrap();
