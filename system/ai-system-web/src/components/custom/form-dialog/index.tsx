import type { UseFormReturn } from 'react-hook-form';
import type { DialogProps } from '@toolpad/core/useDialogs';
import type { BoxProps, ButtonProps, DialogProps as MDialogProps } from '@mui/material';

import {
  Box,
  Stack,
  Dialog,
  Button,
  styled,
  Divider,
  Typography,
  DialogTitle,
  DialogActions,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';

import { Form } from 'src/components/hook-form';

import DialogCloseIcon from './dialog-close-icon';

const StyledDialogForm = styled(Form)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

type Props = {
  children: React.ReactNode;
  methods: UseFormReturn<any>;
  onSubmit: () => void;
  dialogTitle: string;
  loading?: boolean;
  okButtonText?: string;
  cancelButtonText?: string;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
} & MDialogProps;

export type DialogPayloadProps<T = any> = {
  onSuccess?: () => void;
  formData?: Partial<T>;
  extraData?: Partial<T>;
  mode?: 'create' | 'edit' | 'view';
};

export interface FormDialogProps<T = any, R = any> extends DialogProps<DialogPayloadProps<T>, R> {}

export function FormDialog({
  methods,
  onSubmit,
  dialogTitle,
  children,
  loading,
  okButtonProps,
  cancelButtonProps,
  okButtonText = '确定',
  cancelButtonText = '取消',
  ...dialogProps
}: Props) {
  const { isSubmitting } = methods.formState;
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));
  const onClose = () => {
    dialogProps.onClose?.({}, 'backdropClick');
  };

  return (
    <Dialog fullWidth maxWidth="md" fullScreen={false} {...dialogProps}>
      <StyledDialogForm methods={methods} onSubmit={onSubmit}>
        <DialogCloseIcon disabled={isSubmitting} onClose={onClose} />
        <DialogTitle>
          <Stack direction="row">
            <Typography variant="h4">{dialogTitle}</Typography>
          </Stack>
        </DialogTitle>
        <Divider sx={{ borderStyle: 'dashed' }} />
        {loading ? (
          <Stack sx={{ minHeight: 350 }} justifyContent="center" alignItems="center">
            <CircularProgress />
            <Typography sx={{ mt: 2 }} variant="body2">
              加载中...
            </Typography>
          </Stack>
        ) : (
          children
        )}
        <Divider sx={{ borderStyle: 'dashed' }} />
        <DialogActions>
          <Button variant="soft" disabled={isSubmitting} onClick={onClose}>
            <Typography>{cancelButtonText}</Typography>
          </Button>
          <Button
            variant="contained"
            loading={isSubmitting}
            type="submit"
            disabled={loading}
            {...okButtonProps}
          >
            <Typography>{okButtonText}</Typography>
          </Button>
        </DialogActions>
      </StyledDialogForm>
    </Dialog>
  );
}

export function FormDialogContent(props: React.PropsWithChildren & BoxProps) {
  return (
    <Box sx={{ p: 3, ...props.sx }} {...props}>
      {props.children}
    </Box>
  );
}
