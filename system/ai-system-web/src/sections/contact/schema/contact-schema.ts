import { z as zod } from 'zod';

import { AddressSchema } from 'src/common/zod-schema';

export const ContactSchema = zod.object({
  id: zod.string().optional(),
  contactName: zod.string().min(1, { message: '联系人姓名不能为空' }),
  contactPhone: zod.string().min(1, { message: '联系人电话不能为空' }),
  contactWechat: zod.string().optional(),
  address: AddressSchema.nullish(),
});

export type ContactSchemaType = zod.infer<typeof ContactSchema>;
