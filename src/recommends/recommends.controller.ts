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
import { ItemsService } from 'src/items/items.service';
import { UsersService } from 'src/users/users.service';
import { IRecommendDto } from './dto/recommend.dto';
import { RecommendsService } from './recommends.service';
import { Recommend } from './schemas/recommends.schema';

@Controller(apiPrefix)
export class RecommendsController {
  constructor(
    private readonly recommendsService: RecommendsService,
    private readonly itemsService: ItemsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('recommend')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createRecommendDto: IRecommendDto) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const item = new Recommend();

    item.userObjectId = userObjectId;
    item.itemObjectIds = createRecommendDto.itemIds.map(
      (id) => new Types.ObjectId(id),
    );
    item.createTime = new Date();
    item.updateTime = new Date();

    const result = await this.recommendsService.create(item);

    return result;
  }

  @Put('recommend')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() updateRecommendDto: IRecommendDto) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const item = new Recommend();
    item.itemObjectIds = updateRecommendDto.itemIds.map(
      (id) => new Types.ObjectId(id),
    );
    item.updateTime = new Date();

    const result = await this.recommendsService.updateByUserObjectId(
      userObjectId,
      item,
    );

    return result;
  }

  @Get('my-recommend')
  @UseGuards(JwtAuthGuard)
  async myRecommends(@Req() req) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const result = await this.recommendsService.findOneByUserId(userObjectId);

    if (!result) {
      return {};
    }

    const items = await this.itemsService.findByIds(result.itemObjectIds);

    return {
      id: result._id,
      items,
    };
  }

  @Get('get-recommend/:userLogin')
  async getRecommends(@Req() req, @Param('userLogin') userLogin: string) {
    const user = await this.usersService.findByUserLogin(userLogin);

    if (!user) {
      return {
        message: 'User not find',
      };
    }

    const result = await this.recommendsService.findOneByUserId(user._id);

    if (!result) {
      return {};
    }

    const items = await this.itemsService.findByIds(result.itemObjectIds);

    return {
      id: result._id,
      items,
    };
  }
}
