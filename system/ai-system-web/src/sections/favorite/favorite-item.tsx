import { m } from 'framer-motion';
import { useCallback } from 'react';

import { Box, Card, Stack, Typography, IconButton } from '@mui/material';

import API from 'src/services/API';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { AmountTypography } from 'src/components/custom/amount-typography';

export function FavoriteItem(props: {
  item: MyApi.OutputFavoriteDto;
  index: number;
  onClick?: () => void;
  onUnfavorite?: () => void;
}) {
  const { item, index, onClick, onUnfavorite } = props;
  const coverImage = '';

  const handleUnfavorite = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      await API.AppFavorite.AppFavoriteControllerRemoveV1(
        { assetId: item.id },
        { fetchOptions: { showSuccess: false } }
      );
      onUnfavorite?.();
    },
    [item.id, onUnfavorite]
  );
  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      sx={{
        position: 'relative',
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows.card,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.dropdown,
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ position: 'relative' }}>
        <Image src={coverImage} ratio="1/1" sx={{ borderRadius: '8px 8px 0 0' }} />
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(4px)',
            color: 'error.main',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
          }}
          onClick={handleUnfavorite}
        >
          <Iconify icon="solar:heart-bold" width={18} />
        </IconButton>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="h6"
          sx={[
            (theme) => ({
              mb: 0.5,
              ...theme.mixins.maxLine({ line: 2 }),
            }),
          ]}
        >
          商品名称
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
            张三
          </Typography>
        </Stack>
        <AmountTypography
          slotProps={{
            amount: {
              variant: 'h3',
            },
          }}
          amount={99}
        />
      </Box>
    </Card>
  );
}
