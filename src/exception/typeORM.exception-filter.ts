import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExceptionCode } from './custom.exception';
import { TypeORMError } from 'typeorm';

@Catch(TypeORMError)
export class TypeORMExceptionFilter implements ExceptionFilter {
  logger = new Logger(TypeORMExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const code = ExceptionCode.TYPE_ORM_ERROR;

    this.logger.error(
      `HTTP: [${request.method} ${request.url}] EXCEPTION CODE: [${code}] MESSAGE: [${exception.message}]
       USER-AGENT: [${request.headers['user-agent']}]
       STACK: [${exception.stack}]`,
    );

    response.status(status).json({
      code,
      message: exception.message,
      time: new Date(),
      path: request.url,
    });
  }
}
