import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { apiPrefix } from 'src/config';
import { IPostDto } from './dto/post.dto';
import { PostsService } from './posts.service';
import { Post as PostClass, PostDocument } from './schemas/posts.schema';

@Controller(apiPrefix)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('home-posts')
  async getHomePosts(@Req() req, @Query('time') time: number) {
    const filter: FilterQuery<PostDocument> = {};

    if (time) {
      filter.createTime = { $lt: new Date(time) };
    }

    const result = await this.postsService.findWithCreator(filter, null, {
      sort: { createTime: 'desc' },
      limit: 10,
    });

    return result;
  }

  @Post('post')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createPostDto: IPostDto) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const post = new PostClass();

    post.contents = createPostDto.contents;
    post.createUserObjectId = userObjectId;
    post.createTime = new Date();
    post.updateTime = new Date();

    const result = await this.postsService.create(post);

    return result;
  }

  @Put('post')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() updatePostDto: IPostDto) {
    const id = updatePostDto?.id;
    if (!id) {
      throw new HttpException(`id is required`, HttpStatus.BAD_REQUEST);
    }

    const userObjectId = new Types.ObjectId(req.user.userId);

    const post = new PostClass();
    post.contents = updatePostDto.contents;
    post.createUserObjectId = userObjectId;
    post.updateTime = new Date();

    const result = await this.postsService.update(
      {
        _id: id,
        userObjectId,
      },
      post,
    );

    return result;
  }

  @Delete('post/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req, @Param('id') id: string) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const result = await this.postsService.delete({
      _id: id,
      createUserObjectId: userObjectId,
    });

    if (!result) {
      throw new HttpException(
        `can not find post ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return { message: 'Post deleted successfully' };
  }

  @Get('current-user-posts')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserPosts(@Req() req, @Query('time') time: number) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const filter: FilterQuery<PostDocument> = {
      createUserObjectId: userObjectId,
    };

    if (time) {
      filter.createTime = { $lt: new Date(time) };
    }

    const result = await this.postsService.findWithCreator(filter, null, {
      sort: { updateTime: 'desc' },
      limit: 10,
    });

    return result;
  }

  @Get('my-post/:id')
  @UseGuards(JwtAuthGuard)
  async myPost(@Req() req, @Param('id') id: string) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const result = await this.postsService.find({
      _id: id,
      createUserObjectId: userObjectId,
    });

    if (!result[0]) {
      throw new HttpException(
        `can not find post ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return result[0];
  }
}
