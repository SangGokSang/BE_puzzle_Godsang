import {
  ArgumentMetadata,
  PipeTransform,
} from '@nestjs/common/interfaces/features/pipe-transform.interface';
import { UserUpdateDto } from '../dto/user-update.dto';

export class ParseUserUpdateDtoPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): UserUpdateDto {
    if (metadata.metatype !== UserUpdateDto) return value;
    const { nickname, birthdate } = value;
    if (typeof birthdate !== 'number') return value;
    return { nickname, birthdate: new Date(birthdate) };
  }
}
