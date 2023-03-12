import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUserId } from './decorator/get-user-id.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  async refreshToken(
    @Req() req,
    @GetUserId() userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { authorization } = req.headers;
    return await this.authService.refreshToken(authorization, userId);
  }
}
