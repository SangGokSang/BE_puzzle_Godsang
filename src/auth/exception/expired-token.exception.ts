import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpiredTokenException extends HttpException {
  constructor() {
    super('만료된 토큰입니다.', HttpStatus.UNAUTHORIZED);
  }
}
