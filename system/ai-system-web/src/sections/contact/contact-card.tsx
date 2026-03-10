import { useState, useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import { usePopover, type UsePopoverReturn } from 'minimal-shared/hooks';

import { Phone, LocationOn } from '@mui/icons-material';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Button,
  styled,
  Divider,
  MenuItem,
  IconButton,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

import { ContactSelectDrawer } from '.';

const ContactPaper = styled(Paper, { shouldForwardProp: (prop) => prop !== 'isChecked' })<{
  isChecked: boolean;
}>(({ isChecked, theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: theme.vars.customShadows.card,
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: theme.vars.customShadows.z8,
  },
  '&::before': isChecked
    ? {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 6,
        backgroundColor: theme.palette.primary.main,
      }
    : {},
}));

export function useContactCardMoreClick() {
  const popover = usePopover();
  const [targetContact, setTargetContact] = useState<MyApi.OutputContactDto | null>(null);

  const handleMoreClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, data: MyApi.OutputContactDto) => {
      e.stopPropagation();
      setTargetContact(data);
      popover.onOpen(e);
    },
    [popover]
  );
  return {
    targetContact,
    popover,
    handleMoreClick,
  };
}

// ----------------------------------------------------------------------

type ContactCardProps = {
  data: MyApi.OutputContactDto;
  checked?: boolean;
  onSelect?: (data: MyApi.OutputContactDto) => void;
  onMoreClick?: (e: React.MouseEvent<HTMLButtonElement>, data: MyApi.OutputContactDto) => void;
};

export function ContactCard({ data, onSelect, onMoreClick, checked = false }: ContactCardProps) {
  return (
    <ContactPaper isChecked={checked} onClick={() => onSelect?.(data)}>
      <Stack spacing={1}>
        {/* 头部：姓名和默认标签 */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {data.addressName}
            </Typography>
            {data.isDefault && (
              <Chip
                label="默认"
                size="small"
                color="primary"
                sx={{
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
          {onMoreClick && (
            <IconButton
              sx={{ position: 'relative', right: 0, top: -4 }}
              onClick={(e) => {
                e.stopPropagation();
                onMoreClick?.(e, data);
              }}
            >
              <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
            </IconButton>
          )}
        </Stack>

        {/* 地址信息 */}
        <Stack direction="row" alignItems="flex-end" spacing={1}>
          <Stack spacing={0.5} flex={1}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <LocationOn
                sx={{
                  fontSize: 18,
                  color: 'text.secondary',
                  mt: 0.25,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {data.address}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Phone
                sx={{
                  fontSize: 16,
                  color: 'text.secondary',
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {data.contactName} - {data.contactPhone}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify
                icon="custom:wechat-bold"
                width={16}
                height={16}
                sx={{
                  color: 'text.secondary',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {data.wechat}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </ContactPaper>
  );
}

export function ContactCardActionMenu({
  popover,
  targetContact,
  onEdit,
  onSetDefault,
  onDelete,
}: {
  popover: UsePopoverReturn<HTMLElement>;
  targetContact: MyApi.OutputContactDto | null;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
      <MenuItem onClick={onEdit}>
        <Iconify icon="solar:pen-bold" width={20} height={20} />
        编辑
      </MenuItem>
      {!targetContact?.isDefault && (
        <MenuItem onClick={onSetDefault}>
          <Iconify icon="solar:check-circle-bold" width={20} height={20} />
          设为默认
        </MenuItem>
      )}
      <Divider />
      <MenuItem sx={{ color: 'error.main' }} onClick={onDelete}>
        <Iconify icon="solar:trash-bin-trash-bold" width={20} height={20} />
        删除
      </MenuItem>
    </CustomPopover>
  );
}

/**
 * 空地址提示
 */
export type EmptyContactBoxProps = {
  hasError?: boolean;
  onClick?: () => void;
};
export function EmptyContactBox({ hasError, onClick }: EmptyContactBoxProps) {
  return (
    <Box
      sx={{
        py: 2,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        border: '1px dashed',
        borderColor: hasError ? 'error.main' : 'divider',
        borderRadius: 2,
        bgcolor: 'background.neutral',
      }}
    >
      <Iconify
        icon={'mdi:map-marker-off-outline' as any}
        width={48}
        height={48}
        color="text.disabled"
        sx={{ mb: 1 }}
      />
      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
        暂无地址
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', mb: 1 }}>
        请选择联系地址
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={onClick}
        startIcon={<Iconify icon="mingcute:add-line" width={18} height={18} />}
      >
        选择联系地址
      </Button>
    </Box>
  );
}

// 高阶组件，选择联系地址
// 包裹任何组件，使其在 onClick 时能够打开联系地址选择
// 使用方式：
//   const EnhancedButton = withSelectContact(Button);
//   <EnhancedButton onSelectContact={(data) => console.log(data)}>点击选择</EnhancedButton>
export function withSelectContact<P extends object>(Component: React.ComponentType<P>) {
  return function WithSelectContactComponent(
    props: P & {
      onClick?: (e: React.MouseEvent) => void;
      onSelectContact?: (data: MyApi.OutputContactDto) => void;
      selectedContact?: MyApi.OutputContactDto | null;
    }
  ) {
    const dialogs = useDialogs();
    const { onClick, onSelectContact, selectedContact, ...restProps } = props;

    // 选择联系地址
    const handleSelectContact = useCallback(() => {
      dialogs.open(
        ContactSelectDrawer,
        { data: selectedContact },
        {
          onClose: async (data) => {
            if (data && onSelectContact) {
              onSelectContact(data);
            }
          },
        }
      );
    }, [dialogs, onSelectContact, selectedContact]);

    // 合并原有的 onClick 和新的 handleSelectContact
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        // 先执行原有的 onClick（如果存在）
        onClick?.(e);
        // 然后打开联系地址选择
        handleSelectContact();
      },
      [onClick, handleSelectContact]
    );

    return <Component {...(restProps as P)} onClick={handleClick} />;
  };
}
