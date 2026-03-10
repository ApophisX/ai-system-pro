import { OmitType } from '@nestjs/swagger';
import { ContactEntity } from '../entities';

/**
 * 联系人输出 DTO
 */
export class OutputContactDto extends OmitType(ContactEntity, [] as const) {}
