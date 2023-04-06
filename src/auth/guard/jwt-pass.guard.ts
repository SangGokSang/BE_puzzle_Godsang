import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  CustomException,
  ExceptionCode,
} from '../../exception/custom.exception';

@Injectable()
export class JwtPassGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    console.log('jwt pass guard', authorization);
    if (!authorization) return;
    const token = authorization.replace('Bearer ', '');
    request.user = this.validateToken(token);
    return true;
  }

  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (e) {
      switch (e.message) {
        case 'invalid token':
          throw new CustomException(
            ExceptionCode.INVALID_TOKEN,
            e.message,
            HttpStatus.BAD_REQUEST,
          );
        case 'jwt expired':
          throw new CustomException(
            ExceptionCode.EXPIRED_TOKEN,
            e.message,
            410,
          );
        default:
          throw new CustomException(
            ExceptionCode.INTERNAL_SERVER_ERROR,
            e.message,
            500,
          );
      }
    }
  }
}
