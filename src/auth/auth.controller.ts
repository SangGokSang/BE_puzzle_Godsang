import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
}
