import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  CustomException,
  ExceptionCode,
} from '../../exception/custom.exception';
import { JwtPayload } from '../dto/jwt-payload';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;
    if (!authorization) {
      throw new CustomException(
        ExceptionCode.INVALID_TOKEN,
        'Authorization 헤더가 비어 있습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = authorization.replace('Bearer ', '');
    const user: JwtPayload = this.validateToken(token);
    if (user.isWithdrawUser && request.url !== '/api/user/restore') {
      throw new CustomException(
        ExceptionCode.INVALID_USER,
        `탈퇴한 사용자입니다.`,
        403,
      );
    }
    request.user = user;
    return true;
  }

  validateToken(token: string): JwtPayload {
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
        case 'jwt malformed':
          throw new CustomException(
            ExceptionCode.MALFORMED_TOKEN,
            e.message,
            HttpStatus.BAD_REQUEST,
          );
        case 'jwt must be provided':
          throw new CustomException(
            ExceptionCode.INVALID_TOKEN,
            e.message,
            HttpStatus.BAD_REQUEST,
          );
        case 'jwt expired':
          throw new CustomException(
            ExceptionCode.EXPIRED_TOKEN,
            e.message,
            HttpStatus.UNAUTHORIZED,
          );
        default:
          throw new CustomException(
            ExceptionCode.INTERNAL_SERVER_ERROR,
            e.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }
}
