import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RecommendDocument = HydratedDocument<Recommend>;

@Schema({})
export class Recommend {
  @Prop()
  userObjectId: Types.ObjectId;

  @Prop()
  itemObjectIds: Types.ObjectId[];

  @Prop()
  createTime: Date;

  @Prop()
  updateTime: Date;
}

export const RecommendsShema = SchemaFactory.createForClass(Recommend);
