import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
    item.createUserObjectId = userObjectId;
    item.createTime = new Date();
    item.updateTime = new Date();

    const result = await this.itemsService.create(item);

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
}
