import React from 'react';
import { m } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';

import { Stack, Paper, AppBar, Toolbar, InputBase, IconButton } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export const CategoryHeader: React.FC = () => {
  const router = useRouter();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
        zIndex: 1100,
      }}
    >
      <Paper sx={{ borderRadius: 0 }}>
        <Toolbar sx={{ display: 'flex', gap: 1.5, py: 1 }}>
          {/* 返回按钮 */}
          <IconButton
            component={m.button}
            whileTap={{ scale: 0.9 }}
            sx={{ color: 'text.primary' }}
            onClick={() => router.back()}
          >
            <ArrowLeft size={22} />
          </IconButton>

          {/* 搜索框 */}
          <Stack
            component={m.div}
            whileTap={{ scale: 0.98 }}
            sx={{
              flex: 1,
              px: 2,
              py: 0.5,
              borderRadius: 3,
              backgroundColor: (theme) => theme.vars.palette.AppBar.defaultBg,
              cursor: 'pointer',
            }}
            alignItems="center"
            direction="row"
          >
            <Search size={18} style={{ color: '#9ca3af', marginRight: 8 }} />
            <InputBase
              placeholder="搜索分类..."
              fullWidth
              sx={{
                fontSize: '0.9rem',
                '& input::placeholder': {
                  color: 'text.disabled',
                  opacity: 1,
                },
              }}
            />
          </Stack>
        </Toolbar>
      </Paper>
    </AppBar>
  );
};
