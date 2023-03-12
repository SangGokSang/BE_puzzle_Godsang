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

    this.logger.error(
      `HTTP: [${request.method} ${request.url}] HOSTNAME: [${request.hostname}] IP: [${request.ip}] EXCEPTION CODE: [${exception.code}]`,
    );

    response.status(status).json({
      code: exception.code,
      message: exception.message,
      time: new Date(),
      path: request.url,
    });
  }
}
