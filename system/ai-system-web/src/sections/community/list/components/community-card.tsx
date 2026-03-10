import { m } from 'framer-motion';
import { useCallback } from 'react';
import { Lock, Users, Package } from 'lucide-react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Image } from 'src/components/image';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type CommunityCardProps = {
  item: MyApi.OutputCommunityListItemDto;
  index?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  actions?: React.ReactNode;
};

export function CommunityCard({ item, index = 0, onClick, actions }: CommunityCardProps) {
  const { user } = useAuthContext();

  const coverImage = item.coverImage || '';

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.vars.customShadows.card,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: (theme) => theme.vars.customShadows.z8,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Image src={coverImage} alt={item.name} ratio="16/9" />
        <Chip
          size="small"
          icon={item.type === 'private' ? <Lock size={12} /> : undefined}
          label={item.type === 'public' ? '公开' : '私密'}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: (theme) =>
              item.type === 'public'
                ? theme.vars.palette.success.main
                : theme.vars.palette.info.main,
            color: 'common.white',
            fontWeight: 600,
            '& .MuiChip-icon': {
              color: 'inherit',
            },
          }}
        />

        {item.status === 'approved' ? (
          <>
            {item.joined && (
              <Chip
                size="small"
                label={item.creatorId === user?.id ? '创建者' : '成员'}
                color="secondary"
                variant="filled"
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  // bgcolor: 'primary.main',
                  // color: 'primary.contrastText',
                  fontWeight: 600,
                }}
              />
            )}
          </>
        ) : (
          <Chip
            size="small"
            label={item.statusText}
            color="error"
            variant="filled"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 600,
            }}
          />
        )}
      </Box>
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
          {item.name}
        </Typography>
        {item.description && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </Typography>
        )}
        {(item.memberCount !== undefined || item.assetCount !== undefined) && (
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            {item.memberCount !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Users size={14} style={{ color: 'inherit', opacity: 0.7 }} />
                <Typography variant="caption" color="text.secondary">
                  {item.memberCount} 人
                </Typography>
              </Stack>
            )}
            {item.assetCount !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Package size={14} style={{ color: 'inherit', opacity: 0.7 }} />
                <Typography variant="caption" color="text.secondary">
                  {item.assetCount} 件
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </CardContent>
      {actions}
    </Card>
  );
}
