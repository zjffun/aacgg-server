import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SaveOptions, Types } from 'mongoose';
import { Recommend, RecommendDocument } from './schemas/recommends.schema';

@Injectable()
export class RecommendsService {
  constructor(
    @InjectModel(Recommend.name)
    private readonly RecommendsModel: Model<RecommendDocument>,
  ) {}

  async create(recommend: Recommend, options: SaveOptions = {}) {
    const result = await this.RecommendsModel.create([recommend], options);
    return result[0];
  }

  async update(id: Types.ObjectId, newRecommned: Recommend) {
    const result = await this.RecommendsModel.updateOne(
      {
        _id: id,
      },
      {
        $set: newRecommned,
      },
    );

    return result;
  }

  async updateByUserObjectId(id: Types.ObjectId, newRecommned: Recommend) {
    const result = await this.RecommendsModel.updateOne(
      {
        userObjectId: id,
      },
      {
        $set: newRecommned,
      },
    );

    return result;
  }

  async findByIds(ids) {
    const query = this.RecommendsModel.find({
      _id: {
        $in: ids,
      },
    });
    return query.exec();
  }

  async findAll(filter: FilterQuery<any>) {
    const query = this.RecommendsModel.find(filter);
    return query.exec();
  }

  async findOne(_id?: Types.ObjectId) {
    return this.RecommendsModel.findOne({
      _id,
    }).exec();
  }

  async findOneByUserId(_id?: Types.ObjectId) {
    return this.RecommendsModel.findOne({
      userObjectId: _id,
    }).exec();
  }
}
