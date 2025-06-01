import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { IPostContent } from 'src/types';

export type PostDocument = HydratedDocument<Post>;

@Schema({})
export class Post {
  @Prop()
  contents: IPostContent[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createUserObjectId: Types.ObjectId;

  @Prop()
  createTime: Date;

  @Prop()
  updateTime: Date;

  @Prop()
  isPublic: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
