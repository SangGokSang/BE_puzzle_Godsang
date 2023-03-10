import { HttpException, HttpStatus } from '@nestjs/common';

export class DeletedUserException extends HttpException {
  constructor() {
    super('탈퇴한 회원입니다.', HttpStatus.BAD_REQUEST);
  }
}
