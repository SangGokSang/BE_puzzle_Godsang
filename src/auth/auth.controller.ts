import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUserId } from './decorator/get-user-id.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle(@Req() req, @Res() res) {
    return await this.authService.loginOrSignIn(req.user, res);
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async loginKaKao(@Req() req, @Res() res) {
    return await this.authService.loginOrSignIn(req.user, res);
  }

  @Get('/login/naver')
  @UseGuards(AuthGuard('naver'))
  async loginNaver(@Req() req, @Res() res) {
    return await this.authService.loginOrSignIn(req.user, res);
  }

  @Get('/login/facebook')
  @UseGuards(AuthGuard('facebook'))
  async loginFacebook(@Req() req, @Res() res) {
    return await this.authService.loginOrSignIn(req.user, res);
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Req() req, @Res() res, @GetUserId() userId: number) {
    const { refreshToken } = req.cookies['refresh-token'];
    return await this.authService.refreshToken(refreshToken, userId, res);
  }

  @Post('/logout')
  logout(@Req() req: Request, @Res() res) {
    res.cookie('refresh-token', '', {
      maxAge: 0,
    });
    return res.send({
      message: 'success',
    });
  }
}
