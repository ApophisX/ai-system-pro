import { z as zod } from 'zod';

export type BindAssetFormSchemaType = zod.infer<typeof BindAssetFormSchema>;

const imageItemSchema = zod.union([zod.instanceof(File), zod.string()]);

export const BindAssetFormSchema = zod.object({
  /** 资产实例 ID */
  // inventoryId: zod.string().min(1, '请选择要绑定的资产实例'),
  inventoryId: zod
    .union([zod.string(), zod.null()])
    .refine((val) => val !== null, {
      message: '请选择要绑定的资产实例',
    })
    .refine((val) => val !== '', {
      message: '请选择要绑定的资产实例',
    }),
  /** 绑定时对订单的备注 */
  description: zod.string().max(500, '备注不能超过 500 个字符').optional().or(zod.literal('')),
  /** 绑定凭证照片（可选） */
  evidenceUrls: zod.array(imageItemSchema).max(9, '最多上传 9 张照片').default([]).optional(),
});
