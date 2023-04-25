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
  MALFORMED_TOKEN = 'MALFORMED_TOKEN',
  TYPE_ORM_ERROR = 'TYPE_ORM_ERROR',
  HASTY_KEY_UPDATE = 'HASTY_KEY_UPDATE',
}

export class CustomException extends HttpException {
  constructor(public code: ExceptionCode, message: string, status: HttpStatus) {
    super(message, status);
  }
}
