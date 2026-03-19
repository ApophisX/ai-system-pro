import React from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { m, AnimatePresence } from 'framer-motion';
import { Settings, MessageSquare } from 'lucide-react';

import { Box, Stack, alpha, AppBar, Avatar, Toolbar, Typography, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { encryptPhone } from 'src/utils';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

interface ScrollAppBarProps {
  visible: boolean;
}

export const ScrollAppBar: React.FC<ScrollAppBarProps> = ({ visible }) => {
  const router = useRouter();

  const { user } = useAuthContext();

  return (
    <AnimatePresence>
      {visible && (
        <AppBar
          component={m.div}
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          position="fixed"
          sx={(theme) => ({
            top: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            height: 56,
            ...theme.mixins.bgBlur({
              color: varAlpha(theme.vars.palette.background.defaultChannel, 0.3),
              blur: 12,
            }),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          })}
        >
          <Toolbar
            sx={{
              height: 56,
              minHeight: 56,
              px: 2,
            }}
          >
            {/* 左侧：头像和用户信息 */}
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}
              >
                {user?.username?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.username}
                </Typography>
                {user?.phone && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      mt: 0.25,
                    }}
                  >
                    {encryptPhone(user?.phone)}
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* 右侧：消息和设置图标 */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                component={m.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  router.push(paths.message.center);
                }}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.08),
                  },
                }}
              >
                <MessageSquare size={20} />
              </IconButton>
              <IconButton
                component={m.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  router.push(paths.my.settings);
                }}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.08),
                  },
                }}
              >
                <Settings size={20} />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>
      )}
    </AnimatePresence>
  );
};
