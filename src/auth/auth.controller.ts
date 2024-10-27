import {
  Controller,
  Get,
  Post,
  Redirect,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { apiPrefix } from 'src/config';
import getClientOrigin from 'src/utils/getClientOrigin';
import { AuthService } from './auth.service';
import { GithubAuthGuard } from './github-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller(apiPrefix)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('v1/auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(GithubAuthGuard)
  @Get('auth/github')
  async github() {
    return;
  }

  @UseGuards(GithubAuthGuard)
  @Get('auth/github/callback')
  @Redirect(getClientOrigin())
  async githubCallback(@Request() req, @Response() res) {
    const { access_token } = await this.authService.login(req.user);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });
  }
}
