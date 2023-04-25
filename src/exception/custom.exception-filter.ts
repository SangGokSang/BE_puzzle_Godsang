import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomException } from './custom.exception';

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  logger = new Logger(CustomExceptionFilter.name);

  catch(exception: CustomException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.error(
      `HTTP: [${request.method} ${request.url}]
       EXCEPTION CODE: [${exception.code}]
       MESSAGE: [${exception.message}]
       USER-AGENT: [${request.headers['user-agent']}]
       IP: [${request.ip}]
       STACK: [${exception.stack}]`,
    );

    response.status(status).json({
      code: exception.code,
      message: exception.message,
      time: new Date(),
      path: request.url,
    });
  }
}
