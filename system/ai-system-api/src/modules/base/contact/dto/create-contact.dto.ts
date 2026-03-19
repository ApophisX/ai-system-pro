import { OmitType, PickType } from '@nestjs/swagger';

import { ContactEntity } from '../entities';

/**
 * 创建联系人请求 DTO
 */
export class CreateContactDto extends PickType(ContactEntity, [
  'contactName',
  'contactPhone',
  'provinceCode',
  'cityCode',
  'districtCode',
  'wechat',
  'province',
  'city',
  'district',
  'isDefault',
  'address',
  'addressName',
  'longitude',
  'latitude',
]) {}
