import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ItemType } from 'src/types';

export type ItemDocument = HydratedDocument<Item>;

@Schema({})
export class Item {
  @Prop()
  type: ItemType;

  @Prop()
  createUserObjectId: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  desc: string;

  @Prop()
  coverImage: string;

  @Prop()
  episodes?: {
    id: Types.ObjectId;
    name: string;
  }[];

  @Prop()
  chapters?: {
    id: Types.ObjectId;
    name: string;
  }[];

  @Prop()
  createTime: Date;

  @Prop()
  updateTime: Date;
}

export const Itemschema = SchemaFactory.createForClass(Item);
