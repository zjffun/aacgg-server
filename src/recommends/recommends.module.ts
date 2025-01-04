import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { RecommendsController } from './recommends.controller';
import { RecommendsService } from './recommends.service';
import { Recommend, RecommendsShema } from './schemas/recommends.schema';
import { ItemsModule } from 'src/items/items.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommend.name, schema: RecommendsShema },
    ]),
    UsersModule,
    ItemsModule,
  ],
  controllers: [RecommendsController],
  providers: [RecommendsService],
  exports: [RecommendsService],
})
export class RecommendsModule {}
