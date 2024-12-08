import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions, Types } from 'mongoose';
import { Item, ItemDocument } from './schemas/items.schema';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name)
    private readonly ItemsModel: Model<ItemDocument>,
  ) {}

  async create(post: Item, options: SaveOptions = {}) {
    const result = await this.ItemsModel.create([post], options);
    return result[0];
  }

  async update(id: Types.ObjectId, updateItem: Item) {
    const result = await this.ItemsModel.updateOne(
      {
        _id: id,
      },
      {
        $set: updateItem,
      },
    );

    return result;
  }

  async findByIds(ids) {
    const query = this.ItemsModel.find({
      _id: {
        $in: ids,
      },
    });
    return query.exec();
  }

  async findAll() {
    const query = this.ItemsModel.find({});
    return query.exec();
  }

  async findOne(_id?: Types.ObjectId) {
    return this.ItemsModel.findOne({
      _id,
    }).exec();
  }
}
