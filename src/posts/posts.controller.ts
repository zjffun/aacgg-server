import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { apiPrefix } from 'src/config';
import { IPostDto } from './dto/post.dto';
import { PostsService } from './posts.service';
import { Post as PostClass } from './schemas/posts.schema';

@Controller(apiPrefix)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('post')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createPostDto: IPostDto) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const post = new PostClass();

    post.contents = createPostDto.contents;
    post.createUserObjectId = userObjectId;

    const result = await this.postsService.create(post);

    return result;
  }
}