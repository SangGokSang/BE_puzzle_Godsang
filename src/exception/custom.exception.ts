import { HttpException, HttpStatus } from '@nestjs/common';

export enum ExceptionCode {
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_USER = 'INVALID_USER',
  MESSAGE_FULL = 'MESSAGE_FULL',
  NO_KEY = 'NO_KEY',
}

export class CustomException extends HttpException {
  constructor(public code: ExceptionCode, message: string, status: HttpStatus) {
    super(message, status);
  }
}
