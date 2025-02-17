import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SaveOptions, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/posts.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly PostsModel: Model<PostDocument>,
  ) {}

  async create(post: Post, options: SaveOptions = {}) {
    const createdPost = await this.PostsModel.create([post], options);
    return createdPost[0];
  }

  async findWithCreator(
    filter?: FilterQuery<PostDocument>,
    projection?: any,
    options?: any,
  ) {
    const query = this.PostsModel.find(filter, projection, options).populate({
      path: 'createUserObjectId',
      select: 'name avatarImg',
    });

    const result = await query.exec();

    const resultWithCreator = result.map((d) => {
      return {
        ...d.toObject(),
        creator: d.createUserObjectId,
        createUserObjectId: undefined,
      };
    });

    return resultWithCreator;
  }
}
