import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/index.module';
import { ContentsModule } from './contents/contents.module';
import { ItemsModule } from './items/items.module';
import { PostsModule } from './posts/posts.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { RecommendsModule } from './recommends/recommends.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    ScheduleModule.forRoot(),
    ProjectsModule,
    AuthModule,
    UsersModule,
    ContentsModule,
    CommonModule,
    ItemsModule,
    PostsModule,
    RecommendsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    AppService,
  ],
})
export class AppModule {}
