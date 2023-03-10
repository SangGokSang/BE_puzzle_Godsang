import { Controller, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from '../auth/decorator/get-user-id.decorator';
import { UserService } from './user.service';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Delete()
  @UseGuards(AuthGuard('access-token'))
  async deleteUser(@GetUserId() userId: number): Promise<void> {
    await this.userService.deleteUser(userId);
  }
}
