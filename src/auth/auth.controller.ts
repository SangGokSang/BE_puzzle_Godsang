import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(
    @Req() req,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.loginOrSignIn(req.user);
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKaKao(
    @Req() req,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.loginOrSignIn(req.user);
  }

  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  async loginNaver(
    @Req() req,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.loginOrSignIn(req.user);
  }

  @Get('/login/facebook')
  @UseGuards(AuthGuard('facebook'))
  async loginFacebook(
    @Req() req,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.loginOrSignIn(req.user);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('refresh-token'))
  async refreshToken(
    @Req() req,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.refreshToken(req.user);
  }
}
