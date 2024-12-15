import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IPostContent } from 'src/types';

export type PostDocument = HydratedDocument<Post>;

@Schema({})
export class Post {
  @Prop()
  contents: IPostContent[];

  @Prop()
  createUserObjectId: Types.ObjectId;

  @Prop()
  createTime: Date;

  @Prop()
  updateTime: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
