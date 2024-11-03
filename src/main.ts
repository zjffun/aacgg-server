// init dotenv before AppModule, otherwise process.env.MONGODB_URI will be undefined in AppModule
import './initDotEnv';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    origin: [
      'https://aacgg.com',
      'https://www.aacgg.com',
      'https://dev.aacgg.com',
    ],
    credentials: true,
  });

  app.use(cookieParser());

  app.useBodyParser('json', { limit: '10mb' });

  await app.listen(30002);
}

bootstrap();
