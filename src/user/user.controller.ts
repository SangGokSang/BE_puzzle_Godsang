import {
  Body,
  Controller,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GetUserId } from '../auth/decorator/get-user-id.decorator';
import { UserService } from './user.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { ParseUserUpdateDtoPipe } from './pipe/parse-date.pipe';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch()
  @UseGuards(JwtAuthGuard)
  async modifyUser(
    @GetUserId() userId: number,
    @Body(ParseUserUpdateDtoPipe, ValidationPipe) userUpdateDto: UserUpdateDto,
  ) {
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
}
