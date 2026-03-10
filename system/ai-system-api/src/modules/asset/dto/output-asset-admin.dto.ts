import { OutputAssetDetailDto } from './output-asset.dto';

/**
 * 后台资产列表项输出 DTO
 *
 * 复用 AssetDetailDto 结构，包含资产基本信息、出租方、分类、审核状态等
 */
export class OutputAssetAdminListItemDto extends OutputAssetDetailDto {}

/**
 * 后台资产详情输出 DTO
 *
 * 包含完整资产信息，含租赁方案等
 */
export class OutputAssetAdminDetailDto extends OutputAssetDetailDto {}
