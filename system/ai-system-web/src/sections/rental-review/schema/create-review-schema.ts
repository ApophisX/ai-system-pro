import { z as zod } from 'zod';

export const CreateReviewFormSchema = zod.object({
  score: zod.number().min(1, '请选择评分').max(5, '评分范围为1-5'),
  content: zod.string().max(500, '评论内容不能超过500字符').optional(),
  images: zod
    .array(zod.union([zod.instanceof(File), zod.string()]))
    .max(9, '最多上传9张图片')
    .default([])
    .optional(),
});

export type CreateReviewFormValues = zod.infer<typeof CreateReviewFormSchema>;
