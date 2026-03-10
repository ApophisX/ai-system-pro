import type { AppBarProps } from '@mui/material';

import wx from 'weixin-js-sdk';
import { m } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

export type MyAppBarProps = AppBarProps & {
  appTitle: any;
  rightContent?: React.ReactNode;
  onBack?: () => void;
  extra?: React.ReactNode;
};
export function MyAppBar(props: MyAppBarProps) {
  const { appTitle, rightContent, onBack, extra, ...rest } = props;
  const { isInWeChatMiniProgram } = usePlatform();

  const router = useRouter();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      {...rest}
      sx={{
        top: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        color: 'text.primary',
        borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
        ...props.sx,
      }}
    >
      {isInWeChatMiniProgram && typeof appTitle === 'string' ? null : (
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: 1,
            borderBottom: extra ? (theme) => `1px solid ${theme.vars.palette.divider}` : undefined,
          }}
        >
          {!isInWeChatMiniProgram && (
            <Box sx={{ width: 48 }}>
              <IconButton
                component={m.button}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (isInWeChatMiniProgram) {
                    wx.miniProgram.navigateBack({
                      url: '/pages/user/index',
                    });
                  } else if (onBack) {
                    onBack();
                  } else {
                    router.back();
                  }
                }}
                sx={{
                  color: 'text.primary',
                }}
              >
                <ArrowLeft size={20} />
              </IconButton>
            </Box>
          )}

          {typeof appTitle === 'string' ? (
            <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>
              {appTitle}
            </Typography>
          ) : (
            appTitle
          )}
          {rightContent ? rightContent : <Box sx={{ width: 48 }} />}
        </Toolbar>
      )}

      {extra}
    </AppBar>
  );
}
