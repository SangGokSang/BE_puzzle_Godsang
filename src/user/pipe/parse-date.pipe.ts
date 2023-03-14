import {
  ArgumentMetadata,
  PipeTransform,
} from '@nestjs/common/interfaces/features/pipe-transform.interface';
import { UserUpdateDto } from '../dto/user-update.dto';
import {
  CustomException,
  ExceptionCode,
} from '../../exception/custom.exception';
import { HttpStatus } from '@nestjs/common';

export class ParseUserUpdateDtoPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): UserUpdateDto {
    if (metadata.metatype !== UserUpdateDto) return value;
    const { nickname, birthdate } = value;
    try {
      const date = new Date(Number(birthdate));
      return { nickname, birthdate: date };
    } catch (error) {
      throw new CustomException(
        ExceptionCode.INVALID_DATE,
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
