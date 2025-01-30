import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import PERMISSION from 'src/enums/permission';
import ROLE from 'src/enums/role';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
})
export class User {
  @Prop()
  login: string;

  @Prop()
  password: string;

  @Prop()
  role: ROLE;

  @Prop()
  name: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  avatarImg: string;

  @Prop()
  bio: string;

  @Prop()
  email: string;

  @Prop()
  githubId: string;

  @Prop()
  trackItems: {
    objectId: Types.ObjectId;
  }[];

  @Prop()
  watched: {
    itemObjectId: Types.ObjectId;
    episodes: {
      objectId: Types.ObjectId;
    }[];
    chapters: {
      objectId: Types.ObjectId;
    }[];
  }[];

  @Prop()
  projectPermissions: {
    projectId: Types.ObjectId;
    permissions: PERMISSION[];
  }[];

  // TODO: fix vulnerable
  @Prop()
  githubToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
