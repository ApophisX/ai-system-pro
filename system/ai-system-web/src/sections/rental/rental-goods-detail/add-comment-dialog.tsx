import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack } from '@mui/material';

import API from 'src/services/API';

import { Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

export type CommentFormSchemaType = zod.infer<typeof CommentFormSchema>;

export const CommentFormSchema = zod.object({
  content: zod
    .string()
    .min(1, { message: '留言内容不能为空' })
    .max(500, { message: '留言内容不能超过500个字符' }),
  parentId: zod.string().optional(),
  replyToUserId: zod.string().optional(),
});

type DialogPayload = {
  assetId: string;
  parentId?: string;
  replyToUserId?: string;
  replyToUserName?: string;
  onSuccess?: () => void;
};

export function AddCommentDialog(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;

  const { assetId, parentId, replyToUserId, replyToUserName, onSuccess } = payload || {};

  const defaultValues: CommentFormSchemaType = {
    content: '',
    parentId,
    replyToUserId,
  };

  const methods = useForm<CommentFormSchemaType>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
  } = methods;

  const content = watch('content') || '';

  const onSubmit = handleSubmit(async (data) => {
    try {
      await API.AppAssetComment.AppAssetCommentControllerCreateV1({
        assetId: assetId!,
        content: data.content,
        parentId: data.parentId,
        replyToUserId: data.replyToUserId,
      });

      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('提交留言失败:', error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      scroll="paper"
      dialogTitle={parentId ? `回复 ${replyToUserName || '用户'}` : '添加留言'}
      slotProps={{
        paper: {
          sx: {
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text
            name="content"
            label="留言内容"
            placeholder={parentId ? `回复 ${replyToUserName || '用户'}...` : '请输入留言内容...'}
            multiline
            minRows={4}
            maxRows={8}
            helperText={`${content.length}/500`}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
