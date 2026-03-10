import { m } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { Box, Grid, Card, Stack, Typography, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import API from 'src/services/API';
import { useGetMyFavorites } from 'src/actions/favorites';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadMore } from 'src/components/custom/load-more';
import { MyAppBar } from 'src/components/custom/my-app-bar';
import { MobileLayout } from 'src/components/custom/layout';
import { LoadingScreen } from 'src/components/loading-screen';
import { AmountTypography } from 'src/components/custom/amount-typography';

import { useAssetStatus } from 'src/sections/lessor/assets/hooks/use-asset-status';
import { RENTAL_TYPE_UNIT_LABELS } from 'src/sections/rental/constants/rental-plan';

// ----------------------------------------------------------------------

export function FavoriteListView() {
  const router = useRouter();

  const [page, setPage] = useState(0);

  const {
    allData: favorites,
    dataLoading,
    dataValidating,
    hasMore,
    mutate,
  } = useGetMyFavorites({ page });

  return (
    <MobileLayout appTitle="我的收藏">
      {dataLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Grid container spacing={2}>
            {favorites.map((item, index) => (
              <Grid size={6} key={item.id}>
                <FavoriteItem
                  item={item.asset}
                  index={index}
                  onClick={() => router.push(paths.rental.goods.detail(item.asset.id))}
                  onUnfavorite={() => {
                    mutate();
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {favorites.length === 0 && !dataLoading && <EmptyState />}

          <LoadMore
            hasMore={hasMore}
            loading={dataValidating}
            onLoadMore={() => setPage((prev) => prev + 1)}
            disabled={dataLoading}
            show={favorites.length > 0 && favorites.length >= 10}
          />
        </>
      )}
    </MobileLayout>
  );
}

function FavoriteItem(props: {
  item: MyApi.OutputMyAssetListItemDto;
  index: number;
  onClick?: () => void;
  onUnfavorite?: () => void;
}) {
  const { item, index, onClick, onUnfavorite } = props;
  const coverImage = item.coverImage || item.images?.[0];
  const { isOnline } = useAssetStatus(item);

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
      onClick={isOnline ? onClick : undefined}
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

        {!isOnline && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'common.white',
              fontWeight: 'bold',
              fontSize: 14,
              borderRadius: '8px 8px 0 0',
            }}
          >
            暂时不可租
          </Box>
        )}
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
          {item.name}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
            {item.contactName}
          </Typography>
        </Stack>
        <AmountTypography
          slotProps={{
            amount: {
              variant: 'h3',
            },
          }}
          amount={item.rentalPlans?.[0]?.price}
          unit={`/${RENTAL_TYPE_UNIT_LABELS[item.rentalPlans?.[0].rentalType]}`}
        />
      </Box>
    </Card>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
      }}
    >
      <PackageOpen size={64} color="#d1d5db" />
      <Typography variant="h6" sx={{ color: 'text.secondary', mt: 3 }}>
        还没有收藏
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        快去逛逛发现喜欢的宝贝吧
      </Typography>
    </Box>
  );
}
