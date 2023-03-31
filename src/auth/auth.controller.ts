import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUserId } from './decorator/get-user-id.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LoginDto } from './dto/oauth-user.dto';

@Controller('/api/user')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    return await this.authService.loginOrSignIn(loginDto, res);
  }

  @Post('/refresh-token')
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
