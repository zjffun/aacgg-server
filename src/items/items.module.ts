import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item, Itemschema } from './schemas/items.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: Itemschema }]),
    UsersModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
