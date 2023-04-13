import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { GetUserId } from '../auth/decorator/get-user-id.decorator';
import { ParseUserUpdateDtoPipe } from './pipe/parse-date.pipe';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserKeyDto } from './dto/user-key.dto';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/login')
  async login(@Body(ValidationPipe) loginDto: LoginDto, @Res() res) {
    return await this.userService.loginOrSignIn(loginDto, res);
  }

  @Post('/refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Req() req, @Res() res, @GetUserId() userId: number) {
    const { refreshToken } = req.cookies['refresh-token'];
    return await this.userService.refreshToken(refreshToken, userId, res);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res) {
    return await this.userService.logout(res);
  }

  @Patch('/withdraw')
  @UseGuards(JwtAuthGuard)
  async withdrawUser(@GetUserId() userId: number): Promise<void> {
    await this.userService.withdrawUser(userId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @GetUserId() userId: number,
    @Body(ParseUserUpdateDtoPipe, ValidationPipe) userUpdateDto: UserUpdateDto,
  ): Promise<{ nickname: string; birthdate: number }> {
    return await this.userService.updateUser(userId, userUpdateDto);
  }

  @Patch('/restore')
  @UseGuards(JwtAuthGuard)
  async restoreUser(@GetUserId() userId: number): Promise<void> {
    await this.userService.restoreUser(userId);
  }

  @Get('/key')
  @UseGuards(JwtAuthGuard)
  async getUserKeyCount(@GetUserId() userId): Promise<UserKeyDto> {
    return await this.userService.getUserKeyCount(userId);
  }
}
