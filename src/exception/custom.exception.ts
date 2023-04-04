import { HttpException, HttpStatus } from '@nestjs/common';

export enum ExceptionCode {
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_USER = 'INVALID_USER',
  MESSAGE_FULL = 'MESSAGE_FULL',
  NO_KEY = 'NO_KEY',
  MESSAGE_ALREADY_OPEN = 'MESSAGE_ALREADY_OPEN',
  INVALID_DATE = 'INVALID_DATE',
  PUZZLE_FULL = 'PUZZLE_FULL',
  MALFORMED_TOKEN = 'MALFORMED_TOKEN',
}

export class CustomException extends HttpException {
  constructor(public code: ExceptionCode, message: string, status: HttpStatus) {
    super(message, status);
  }
}
