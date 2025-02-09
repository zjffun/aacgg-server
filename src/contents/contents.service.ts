import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/contents.schema';

@Injectable()
export class ContentsService {
  constructor(
    @InjectModel(Content.name)
    private readonly ContentsModel: Model<ContentDocument>,
  ) {}

  async createIfNotExist(content: Content) {
    const { sha } = content;

    const doc = await this.ContentsModel.findOneAndUpdate(
      {
        sha,
      },
      { $setOnInsert: content },
      { upsert: true, new: true },
    ).exec();

    return doc;
  }

  async findOne(condition) {
    return this.ContentsModel.findOne({
      sha: condition.sha,
    }).exec();
  }
}
