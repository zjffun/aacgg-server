import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IJwtUser } from 'src/auth/jwt.strategy';
import { apiPrefix } from 'src/config';
import { UsersService } from './users.service';
import { User } from './schemas/users.schema';
import { AuthService } from 'src/auth/auth.service';

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
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

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

  @Post('user/password-login')
  async passwordLogin(
    @Request() req,
    @Response({
      passthrough: true,
    })
    res,
  ) {
    const userData = req.body;

    const loginOrEmail = userData?.loginOrEmail?.trim?.() || '';
    if (!loginOrEmail) {
      throw new HttpException(
        'Login name / Email is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const password = userData?.password?.trim?.() || '';
    if (!password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }

    // TODO: email
    const user = await this.authService.validateUser(loginOrEmail, password);

    if (!user) {
      throw new HttpException(
        'User not exist, or password is wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const loginResult = await this.authService.login(user);

      res.cookie('access_token', loginResult?.access_token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'User login failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {};
  }

  @Post('user')
  async createUser(
    @Request() req,
    @Response({
      passthrough: true,
    })
    res,
  ) {
    const userData = req.body;

    const login = userData?.login?.trim?.() || '';
    if (!login) {
      throw new HttpException('Login name is required', HttpStatus.BAD_REQUEST);
    }

    const validateLogin = /[a-z\d_]+/.test(login);
    if (!validateLogin) {
      throw new HttpException(
        'Login name must contain only lowercase letters, numbers, and underscores',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isLoginExist = await this.usersService.checkLoginExist(login);
    if (isLoginExist) {
      throw new HttpException('Login name is exist', HttpStatus.BAD_REQUEST);
    }

    const password = userData?.password?.trim?.() || '';
    if (!password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    const isValidPassword = passwordPattern.test(password);
    if (!isValidPassword) {
      throw new HttpException(
        'Password must be at least 8 characters long, contain at least one letter and one number',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = new User();
    user.login = login;
    user.password = password;
    user.email = userData?.email?.trim?.() || '';

    const createdUser = await this.usersService.create(user);

    if (!createdUser) {
      throw new HttpException(
        'User creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const loginResult = await this.authService.login(createdUser);

      res.cookie('access_token', loginResult?.access_token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'User login failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {};
  }

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
