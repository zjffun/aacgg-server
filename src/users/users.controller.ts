import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IJwtUser } from 'src/auth/jwt.strategy';
import { apiPrefix } from 'src/config';
import { UsersService } from './users.service';

async function pickUserInfo(user) {
  const { pick } = await import('lodash-es');
  const result = pick(user, [
    'login',
    'name',
    'avatarUrl',
    'email',
    'bio',
    'avatarImg',
  ]);
  return result;
}

@Controller(apiPrefix)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('v1/user')
  async getUser(@Query('login') login: string) {
    const user = await this.usersService.findOne({
      login,
    });
    const result = pickUserInfo(user);
    return result;
  }

  @Get('v1/current-user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const jwtUser = req.user as IJwtUser;
    const user = await this.usersService.findById(jwtUser.userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const result = pickUserInfo(user);
    return result;
  }

  // @Post('user')
  // async createUser(@Request() req) {
  //   const userData = req.body;
  //   const createdUser = await this.usersService.create(userData);
  //   return {
  //     message: 'User created successfully',
  //     user: createdUser,
  //   };
  // }

  @Put('user')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Request() req) {
    const userData = req.body;

    const jwtUser = req.user as IJwtUser;
    const user = await this.usersService.findById(jwtUser.userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const login = userData?.login?.trim?.() || '';
    if (!login) {
      throw new HttpException('Login name is required', HttpStatus.BAD_REQUEST);
    }

    if (login !== user.login) {
      const isLoginExist = await this.usersService.checkLoginExist(login);

      if (isLoginExist) {
        throw new HttpException('Login name is exist', HttpStatus.BAD_REQUEST);
      }
    }

    const result = await this.usersService.updateById(user._id, {
      login,
      name: userData?.name || '',
      email: userData?.email || '',
      bio: userData?.bio || '',
      avatarImg: userData?.avatarImg || '',
    });

    return {
      result: Boolean(result),
    };
  }

  @Get('v1/current-user/permissions')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserPermission(@Request() req, @Query('path') path: string) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const permissionSet = await this.usersService.getPathPermissionSet({
      path: path,
      userId: userObjectId,
    });

    return [...permissionSet];
  }
}
