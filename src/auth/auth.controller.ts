import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUserId } from './decorator/get-user-id.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('/api/user')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body(ValidationPipe) loginDto: LoginDto, @Res() res) {
    return await this.authService.loginOrSignIn(loginDto, res);
  }

  @Post('/refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Req() req, @Res() res, @GetUserId() userId: number) {
    const { refreshToken } = req.cookies['refresh-token'];
    return await this.authService.refreshToken(refreshToken, userId, res);
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res() res) {
    return await this.authService.logout(res);
  }
}
