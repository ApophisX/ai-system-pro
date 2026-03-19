import type { UserRole } from './types';

import React from 'react';
import { m } from 'framer-motion';
import { useDialogs } from '@toolpad/core/useDialogs';
import { Edit3, Shield, QrCode, Settings, Building2 } from 'lucide-react';

import {
  Box,
  Chip,
  Stack,
  Paper,
  alpha,
  Avatar,
  styled,
  Typography,
  IconButton,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { UserQrcodeDialog } from './user-qrcode-dialog';

// ----------------------------------------------------------------------

interface UserProfileHeaderProps {
  role: UserRole;
}

const PaperCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: 0,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'common.white',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  paddingInline: theme.spacing(2),
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: `alpha(${theme.palette.common.white}, 0.1)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: `alpha(${theme.palette.common.white}, 0.08)`,
  },
}));

export const UserProfileHeader = React.forwardRef<HTMLDivElement, UserProfileHeaderProps>(
  ({ role }, ref) => {
    const router = useRouter();
    const dialogs = useDialogs();

    const { user } = useAuthContext();

    if (!user) return null;

    const isEnterpriseVerified =
      user.userType === 'enterprise' && user.enterpriseVerificationStatus === 'verified';

    return (
      <Box
        ref={ref}
        component={m.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <PaperCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ position: 'relative', zIndex: 1 }}
            spacing={2}
          >
            {/* 左侧：用户信息 */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Box
                component={m.div}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{ position: 'relative' }}
              >
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '3px solid',
                    borderColor: 'common.white',
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  {user.username?.charAt(0)}
                </Avatar>
                {user.verificationStatus === 'verified' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid',
                      borderColor: 'common.white',
                    }}
                  >
                    <Shield size={12} color="white" />
                  </Box>
                )}
              </Box>

              <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Stack>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'common.white' }}>
                      {user.username}
                    </Typography>
                  </Stack>
                  {isEnterpriseVerified && (
                    <Chip
                      icon={<Building2 size={14} />}
                      label="企业"
                      size="small"
                      sx={{
                        borderRadius: 0.5,
                        px: 0.5,
                        bgcolor: alpha('#fff', 0.2),
                        color: 'common.white',
                        '& .MuiChip-icon': {
                          color: 'common.white',
                        },
                      }}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="eva:star-fill" sx={{ color: 'warning.main' }} />
                </Stack>
              </Stack>
            </Stack>

            {/* 右侧：角色选择和设置按钮 */}
            <Stack direction="row" spacing={1} alignItems="center">
              {/* 二维码按钮 */}
              {role === 'lessor' && (
                <IconButton
                  component={m.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  sx={{
                    color: 'common.white',
                    bgcolor: alpha('#fff', 0.15),
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.25),
                    },
                  }}
                  onClick={() =>
                    dialogs.open(UserQrcodeDialog, {
                      userId: user.id,
                      username: user.username,
                      role,
                    })
                  }
                >
                  <QrCode size={20} />
                </IconButton>
              )}

              {/* 设置按钮 */}
              <IconButton
                component={m.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  router.push(paths.my.settings);
                }}
                sx={{
                  color: 'common.white',
                  bgcolor: alpha('#fff', 0.15),
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.25),
                  },
                }}
              >
                <Settings size={20} />
              </IconButton>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" sx={{ mt: 2 }} spacing={2}>
            {/* 编辑资料按钮 */}
            <Box
              component={m.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              sx={{ position: 'relative', zIndex: 1 }}
            >
              <Box
                component="button"
                onClick={() => {
                  router.push(paths.my.profileEdit);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: alpha('#fff', 0.15),
                  border: 'none',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75,
                  color: 'common.white',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.25),
                  },
                }}
              >
                <Edit3 size={14} />
                <Typography variant="body2">编辑资料</Typography>
              </Box>
            </Box>
          </Stack>
        </PaperCard>
      </Box>
    );
  }
);

UserProfileHeader.displayName = 'UserProfileHeader';
