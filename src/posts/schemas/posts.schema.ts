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
}

export const PostSchema = SchemaFactory.createForClass(Post);
