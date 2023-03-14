import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GetUserId } from '../auth/decorator/get-user-id.decorator';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { ParseUserUpdateDtoPipe } from './pipe/parse-date.pipe';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserKeyDto } from './dto/user-key.dto';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @GetUserId() userId: number,
    @Body(ParseUserUpdateDtoPipe, ValidationPipe) userUpdateDto: UserUpdateDto,
  ) {
    console.log(userUpdateDto);
    await this.userService.updateUser(userId, userUpdateDto);
  }

  @Patch('/withdraw')
  @UseGuards(JwtAuthGuard)
  async withdrawUser(@GetUserId() userId: number): Promise<void> {
    await this.userService.withdrawUser(userId);
  }

  @Patch('/restore')
  @UseGuards(JwtAuthGuard)
  async restoreUser(@GetUserId() userId: number): Promise<void> {
    await this.userService.restoreUser(userId);
  }

  @Get('/key')
  @UseGuards(JwtAuthGuard)
  async getUser(@GetUserId() userId): Promise<UserKeyDto> {
    return await this.userService.getUserKeyCount(userId);
  }
}
