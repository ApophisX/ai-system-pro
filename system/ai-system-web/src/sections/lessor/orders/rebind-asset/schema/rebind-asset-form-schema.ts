import { z as zod } from 'zod';

export type RebindAssetFormSchemaType = zod.infer<typeof RebindAssetFormSchema>;

const imageItemSchema = zod.union([zod.instanceof(File), zod.string()]);

export const RebindAssetFormSchema = zod.object({
  /** 目标资产实例 ID */
  inventoryId: zod
    .union([zod.string(), zod.null()])
    .refine((val) => val !== null, {
      message: '请选择要换绑的资产实例',
    })
    .refine((val) => val !== '', {
      message: '请选择要换绑的资产实例',
    }),
  /** 换绑原因/备注 */
  reason: zod.string().max(500, '换绑原因不能超过 500 个字符').optional().or(zod.literal('')),
  /** 换绑留痕图片（可选） */
  evidenceUrls: zod.array(imageItemSchema).max(9, '最多上传 9 张照片').default([]).optional(),
  /** 换绑凭证描述（可选） */
  description: zod.string().max(500, '描述不能超过 500 个字符').optional().or(zod.literal('')),
});
