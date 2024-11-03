import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions, Types } from 'mongoose';
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

  async find(filter: { createUserObjectId?: Types.ObjectId }) {
    const query = this.PostsModel.find({
      ...filter,
    });

    return query.exec();
  }
}
