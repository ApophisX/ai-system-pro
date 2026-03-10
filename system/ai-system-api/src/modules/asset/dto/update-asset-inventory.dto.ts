import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAssetInventoryDto } from './create-asset-inventory.dto';

/**
 * 更新资产实例请求 DTO
 */
export class UpdateAssetInventoryDto extends OmitType(PartialType(CreateAssetInventoryDto), [
  'quantity',
  'isBatchCreate',
]) {}
