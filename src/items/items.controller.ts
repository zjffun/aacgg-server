import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { apiPrefix } from 'src/config';
import { IItemDto } from './dto/item.dto';
import { ItemsService } from './items.service';
import { Item as ItemClass } from './schemas/items.schema';
import { UsersService } from 'src/users/users.service';
import { ItemType } from 'src/types';

@Controller(apiPrefix)
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('item')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createItemDto: IItemDto) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const item = new ItemClass();

    item.type = createItemDto.type;
    item.name = createItemDto.name;
    item.desc = createItemDto.desc;
    item.episodes = createItemDto.episodes?.map((episode) => {
      return {
        id: new Types.ObjectId(episode.id),
        name: episode.name,
      };
    });
    item.chapters = createItemDto.chapters?.map((episode) => {
      return {
        id: new Types.ObjectId(episode.id),
        name: episode.name,
      };
    });
    item.createUserObjectId = userObjectId;
    item.createTime = new Date();
    item.updateTime = new Date();

    const result = await this.itemsService.create(item);

    return result;
  }

  @Put('item')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() updateItemDto: IItemDto) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    if (!updateItemDto.id) {
      throw new Error('itemId is required');
    }

    const item = new ItemClass();

    item.type = updateItemDto.type;
    item.name = updateItemDto.name;
    item.desc = updateItemDto.desc;
    item.episodes = updateItemDto.episodes.map((episode) => {
      return {
        id: new Types.ObjectId(episode.id),
        name: episode.name,
      };
    });

    const result = await this.itemsService.update(
      new Types.ObjectId(updateItemDto.id),
      item,
    );

    return result;
  }

  @Get('track-items')
  @UseGuards(JwtAuthGuard)
  async getTarckItems(@Req() req, @Query('type') type: ItemType) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const tarckItemObjectIds = await this.usersService.getTrackItemObjectIds(
      userObjectId,
    );

    const items = await this.itemsService.findByIds(tarckItemObjectIds);

    const filteredItems = items.filter((item) => {
      if (type) {
        return item.type === type;
      }
      return true;
    });

    return filteredItems;
  }

  @Get('all-items')
  async getAllItems(@Req() req, @Query('type') type?: ItemType) {
    const filter = {};
    if (type) {
      filter['type'] = type;
    }

    const result = await this.itemsService.findAll(filter);

    return result;
  }

  @Get('get-item/:id')
  async getItem(@Req() req, @Param('id') id: string) {
    const result = await this.itemsService.findOne(new Types.ObjectId(id));

    return result;
  }

  @Get('get-item-favorite/:id')
  @UseGuards(JwtAuthGuard)
  async getItemFavorite(@Req() req, @Param('id') id: string) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    if (!id) {
      throw new Error('itemId is required');
    }

    const trackItems = await this.usersService.getTrackItemObjectIds(
      userObjectId,
    );

    const result = trackItems.some((d) => d.toString() === id);

    return {
      favorite: result,
    };
  }

  @Get('get-item-progress/:id')
  @UseGuards(JwtAuthGuard)
  async getItemProgress(@Req() req, @Param('id') id: string) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    if (!id) {
      throw new Error('itemId is required');
    }

    const result = await this.itemsService.findOne(new Types.ObjectId(id));

    const watched = await this.usersService.getWatched({
      userObjectId,
      itemObjectId: new Types.ObjectId(id),
    });

    let subItems = [];

    if (result.type === ItemType.ANIME) {
      subItems = watched?.episodes;
    } else if (result.type === ItemType.COMIC) {
      subItems = watched?.chapters;
    }

    return {
      progress:
        subItems?.map((d) => {
          return {
            id: d.objectId,
          };
        }) || [],
    };
  }

  @Post('track-item')
  @UseGuards(JwtAuthGuard)
  async trackItem(
    @Req() req,
    @Body()
    trackItemDto: {
      itemId: string;
    },
  ) {
    if (!trackItemDto.itemId) {
      throw new Error('itemId is required');
    }

    const userObjectId = new Types.ObjectId(req.user.userId);

    const result = await this.usersService.addTarckItem(
      userObjectId,
      new Types.ObjectId(trackItemDto.itemId),
    );

    return result;
  }

  @Post('remove-track-item')
  @UseGuards(JwtAuthGuard)
  async removeTrackItem(
    @Req() req,
    @Body()
    trackItemDto: {
      itemId: string;
    },
  ) {
    if (!trackItemDto.itemId) {
      throw new Error('itemId is required');
    }

    const userObjectId = new Types.ObjectId(req.user.userId);

    const result = await this.usersService.removeTarckItem(
      userObjectId,
      new Types.ObjectId(trackItemDto.itemId),
    );

    return result;
  }

  @Put('set-progress-to')
  @UseGuards(JwtAuthGuard)
  async setProgressTo(
    @Req() req,
    @Body()
    data: {
      itemId: string;
      subItemId: string;
    },
  ) {
    if (!data.itemId) {
      throw new Error('itemId is required');
    }

    const userObjectId = new Types.ObjectId(req.user.userId);

    const item = await this.itemsService.findOne(
      new Types.ObjectId(data.itemId),
    );

    function sliceById(subItems, id) {
      if (!Array.isArray(subItems)) {
        return [];
      }

      const reversedSubItems = subItems.slice().reverse();

      const index = reversedSubItems.findIndex((d) => {
        return d.id.toString() === id;
      });

      return reversedSubItems.slice(0, index + 1).map((d) => {
        return {
          objectId: d.id,
        };
      });
    }

    if (item.type === ItemType.ANIME) {
      const result = await this.usersService.setWatched({
        userObjectId,
        watched: {
          itemObjectId: new Types.ObjectId(data.itemId),
          episodes: sliceById(item.episodes, data.subItemId),
          chapters: [],
        },
      });

      return result;
    } else if (item.type === ItemType.COMIC) {
      const result = await this.usersService.setWatched({
        userObjectId,
        watched: {
          itemObjectId: new Types.ObjectId(data.itemId),
          episodes: [],
          chapters: sliceById(item.chapters, data.subItemId),
        },
      });

      return result;
    }

    return false;
  }
}
