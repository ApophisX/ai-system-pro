import type { DialogProps } from '@toolpad/core/useDialogs';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack } from '@mui/material';

import API from 'src/services/API';

import { Field } from 'src/components/hook-form';
import { FormDialog, FormDialogContent } from 'src/components/custom/form-dialog';

// ----------------------------------------------------------------------

const ReplyFormSchema = zod.object({
  replyContent: zod.string().min(1, '回复内容不能为空').max(500, '回复内容不能超过500字符'),
});

type ReplyFormValues = zod.infer<typeof ReplyFormSchema>;

type DialogPayload = {
  reviewId: string;
  onSuccess?: () => void;
};

export function ReviewReplyDialog(props: DialogProps<DialogPayload, void>) {
  const { open, onClose, payload } = props;
  const { reviewId, onSuccess } = payload || {};

  const methods = useForm<ReplyFormValues>({
    resolver: zodResolver(ReplyFormSchema),
    defaultValues: { replyContent: '' },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!reviewId) return;
    await API.AppRentalReview.AppRentalReviewControllerReplyV1(
      { id: reviewId },
      { replyContent: data.replyContent },
      { fetchOptions: { useApiMessage: true } }
    );
    methods.reset();
    onSuccess?.();
    onClose();
  });

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      methods={methods}
      onSubmit={onSubmit}
      dialogTitle="回复评价"
      okButtonText="提交回复"
      slotProps={{
        paper: { sx: { border: (theme) => `1px solid ${theme.palette.divider}` } },
      }}
    >
      <FormDialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text
            name="replyContent"
            label="回复内容"
            placeholder="请输入回复内容..."
            multiline
            minRows={4}
            maxRows={8}
            slotProps={{ input: { inputProps: { maxLength: 500 } } }}
          />
        </Stack>
      </FormDialogContent>
    </FormDialog>
  );
}
