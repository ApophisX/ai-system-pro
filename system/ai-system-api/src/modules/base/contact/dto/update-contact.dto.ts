import { PartialType } from '@nestjs/swagger';
import { CreateContactDto } from '.';

/**
 * 更新地址请求 DTO
 */
export class UpdateContactDto extends PartialType(CreateContactDto) {}
