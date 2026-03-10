import { m } from 'framer-motion';
import { useRef, useEffect, useCallback } from 'react';

import { Typography, CircularProgress } from '@mui/material';

import { HorizontalStack } from '../layout';

// ----------------------------------------------------------------------

type Props = {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  disabled?: boolean;
  show?: boolean;
};

export function LoadMore({ hasMore, loading, onLoadMore, disabled, show = true }: Props) {
  const loader = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading && !disabled) {
        onLoadMore();
      }
    },
    [hasMore, loading, disabled, onLoadMore]
  );

  useEffect(() => {
    const loaderCurrent = loader.current;
    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderCurrent) {
      observer.observe(loaderCurrent);
    }
    return () => {
      if (loaderCurrent) {
        observer.unobserve(loaderCurrent);
      }
    };
  }, [handleObserver]);

  if (!show) {
    return null;
  }

  if (!hasMore && !loading) {
    return (
      <Typography
        component={m.p}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        variant="caption"
        sx={{ py: 3, textAlign: 'center', display: 'block', color: 'text.disabled' }}
      >
        — 已经到底啦 —
      </Typography>
    );
  }

  return (
    <HorizontalStack ref={loader} spacing={1} justifyContent="center" py={3}>
      {loading && (
        <>
          <CircularProgress size={14} sx={{ color: 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            加载中...
          </Typography>
        </>
      )}
    </HorizontalStack>
  );
}
