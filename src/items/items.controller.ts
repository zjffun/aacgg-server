import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
    item.episodes = createItemDto.episodes.map((episode) => {
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
  async getTarckItems(@Req() req) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const tarckItemObjectIds = await this.usersService.getTrackItemObjectIds(
      userObjectId,
    );

    const result = await this.itemsService.findByIds(tarckItemObjectIds);

    return result;
  }

  @Get('all-items')
  async getAllItems(@Req() req) {
    const result = await this.itemsService.findAll();

    return result;
  }

  // TODO: get user withoud JwtAuthGuard
  @Get('get-item/:id')
  @UseGuards(JwtAuthGuard)
  async getItem(@Req() req, @Param('id') id: string) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    if (!id) {
      throw new Error('itemId is required');
    }

    const result = await this.itemsService.findOne(new Types.ObjectId(id));

    const watchedEpisodes = await this.usersService.getWatched({
      userObjectId,
      itemObjectId: new Types.ObjectId(id),
    });

    result.episodes = result.episodes.map((episode) => {
      return {
        ...episode,
        watched: Boolean(
          watchedEpisodes.find(
            (d) => d.objectId.toString() === episode.id.toString(),
          ),
        ),
      };
    });

    return result;
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

  @Put('mark-watched-episodes')
  @UseGuards(JwtAuthGuard)
  async markWatchedEpisodes(
    @Req() req,
    @Body()
    data: {
      itemId: string;
      episodeIds: string[];
    },
  ) {
    if (!data.itemId) {
      throw new Error('itemId is required');
    }

    const userObjectId = new Types.ObjectId(req.user.userId);

    const result = await this.usersService.addWatched({
      userObjectId,
      itemObjectId: new Types.ObjectId(data.itemId),
      episodes: data.episodeIds.map((episodeId) => {
        return {
          objectId: new Types.ObjectId(episodeId),
        };
      }),
    });

    return result;
  }
}
