import { z as zod } from 'zod';

import { AssetInventoryStatus } from 'src/constants/asset-inventory';

export type InventoryInstanceFormSchemaType = zod.infer<typeof InventoryInstanceFormSchema>;

const imageItemSchema = zod.union([zod.instanceof(File), zod.string()]);

export const InventoryInstanceFormSchema = zod
  .object({
    isBatchCreate: zod.boolean().default(false),
    quantity: zod.coerce
      .number()
      .int()
      .min(1, { message: '至少创建 1 个' })
      .max(100, { message: '最多创建 100 个' })
      .optional(),
    codePrefix: zod.string().max(8, { message: '编号前缀最多 8 个字符' }).optional(),
    instanceCode: zod.string().max(50, { message: '实例编号不能超过50个字符' }).optional(),
    instanceName: zod
      .string()
      .max(200, { message: '实例名称不能超过200个字符' })
      .optional()
      .or(zod.literal('')),
    status: zod.enum(AssetInventoryStatus),
    images: zod.array(imageItemSchema).max(9, { message: '最多上传 9 张图片' }).default([]),
    remark: zod.string().max(200, { message: '备注不能超过200个字符' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isBatchCreate) {
      const q = data.quantity ?? 0;
      if (q < 1) {
        ctx.addIssue({ code: 'custom', message: '请输入批量创建数量', path: ['quantity'] });
      }
    }
  });
