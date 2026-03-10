import type { StackProps } from '@mui/material';

import { m } from 'framer-motion';
import { Heart, Share2, ArrowLeft } from 'lucide-react';

import { Box, Stack, AppBar, Toolbar, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useParams } from 'src/routes/hooks/use-params';

import { usePlatform } from 'src/hooks/use-platform';

import { Iconify } from 'src/components/iconify';

type Props = {
  preview?: boolean;
  assetDetail?: MyApi.OutputAssetDetailDto;
  onFavorite?: () => void;
  onComment?: () => void;
};

export function RentalGoodsDetailAppBar({
  preview = false,
  assetDetail,
  onFavorite,
  onComment,
}: Props) {
  const { isInWeChatMiniProgram } = usePlatform();
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 1 }}>
        {isInWeChatMiniProgram ? (
          <Box />
        ) : (
          <IconButton
            component={m.button}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              router.back();
            }}
            sx={{
              bgcolor: 'background.default',
              backdropFilter: 'blur(8px)',
              color: 'text.primary',
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
        )}
        {preview ? null : (
          <Stack direction="row" spacing={1}>
            <IconButton
              component={m.button}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (assetId) {
                  router.push(paths.rental.report.root(assetId));
                }
              }}
              sx={{
                bgcolor: 'background.default',
                backdropFilter: 'blur(8px)',
                color: 'text.primary',
              }}
            >
              <Iconify icon="solar:danger-triangle-bold" width={20} height={20} />
            </IconButton>
            <IconButton
              component={m.button}
              whileTap={{ scale: 0.9 }}
              onClick={onComment}
              sx={{
                bgcolor: 'background.default',
                backdropFilter: 'blur(8px)',
                color: 'text.primary',
              }}
            >
              <Iconify icon="solar:chat-round-dots-bold" width={20} height={20} />
            </IconButton>
            <ToolbarButton
              onClick={onFavorite}
              sx={{
                color: assetDetail?.isFavorite ? 'error.main' : 'text.primary',
              }}
            >
              <Heart size={20} fill={assetDetail?.isFavorite ? 'currentColor' : 'none'} />
            </ToolbarButton>
            {/* <IconButton
              component={m.button}
              whileTap={{ scale: 0.9 }}
              sx={{
                bgcolor: 'background.default',
                backdropFilter: 'blur(8px)',
                color: 'text.primary',
              }}
            >
              <Share2 size={20} />
            </IconButton> */}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}

function ToolbarButton(props: StackProps) {
  return (
    <Stack
      component={m.div}
      whileTap={{ scale: 0.9 }}
      {...props}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backdropFilter: 'blur(8px)',
        width: 36,
        height: 36,
        borderRadius: '50%',
        cursor: 'pointer',
        ...props.sx,
      }}
    >
      {props.children}
    </Stack>
  );
}
