import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleLogin(): Promise<void> {}

  @Get('callback/google')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.authService.findUserByEmailOrSave(req.user);
    const { accessToken, refreshToken } = this.authService.createToken(user);
    await this.authService.updateHashedRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }
}
