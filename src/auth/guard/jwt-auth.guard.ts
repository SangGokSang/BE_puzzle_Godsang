import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  CustomException,
  ExceptionCode,
} from '../../exception/custom.exception';

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
    if (authorization === undefined) {
      throw new CustomException(
        ExceptionCode.INVALID_TOKEN,
        'Authorization 헤더가 비어 있습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = authorization.replace('Bearer ', '');
    const user = this.validateToken(token);
    if (user.isDeleted && request.url !== '/api/user/restore') {
      throw new CustomException(
        ExceptionCode.INVALID_USER,
        `탈퇴한 사용자입니다.`,
        403,
      );
    }
    request.user = user;
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
            '잘못 된 토큰입니다.',
            HttpStatus.BAD_REQUEST,
          );
        case 'jwt expired':
          throw new CustomException(
            ExceptionCode.EXPIRED_TOKEN,
            '만료된 토큰입니다.',
            410,
          );
        default:
          throw new CustomException(
            ExceptionCode.INTERNAL_SERVER_ERROR,
            '서버 오류입니다.',
            500,
          );
      }
    }
  }
}
