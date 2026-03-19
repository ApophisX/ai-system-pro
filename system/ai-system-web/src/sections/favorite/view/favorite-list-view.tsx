import React, { useState } from 'react';
import { PackageOpen } from 'lucide-react';

import { Box, Grid, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useGetMyFavorites } from 'src/actions/favorites';

import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';
import { LoadingScreen } from 'src/components/loading-screen';

import { FavoriteItem } from '../favorite-item';

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
                  item={item}
                  index={index}
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
