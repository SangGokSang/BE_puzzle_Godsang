import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomException, ExceptionCode } from './custom.exception';

@Catch(CustomException, HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  logger = new Logger(CustomExceptionFilter.name);

  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.error(exception);

    response.status(status).json({
      code: exception.code ?? ExceptionCode.INTERNAL_SERVER_ERROR,
      message: exception.message,
      time: new Date(),
      path: request.url,
    });
  }
}
