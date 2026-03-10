import type { RentalReviewListItem } from '../types';

import { Box, Stack, alpha, Avatar, Rating, Typography } from '@mui/material';

import { Image } from 'src/components/image';
import { FadeInBox } from 'src/components/custom';
import { MultiFilePreview } from 'src/components/upload';

import { ReplyBlock, ReviewCardRoot } from '../styled';

// ----------------------------------------------------------------------

type Props = {
  review: RentalReviewListItem;
  index?: number;
  showAsset?: boolean;
};

export function ReviewCard({ review, index = 0, showAsset }: Props) {
  const images = review.images ?? [];
  const score = (review as RentalReviewListItem & { score?: number }).score ?? 5;

  const nickname =
    review.lesseeNickname ??
    review.lessee?.profile?.nickname ??
    review.lessee?.username ??
    '匿名用户';

  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '';

  return (
    <FadeInBox>
      <ReviewCardRoot variant="outlined">
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Avatar
            src={review.lessee?.avatar}
            sx={{
              width: 48,
              height: 48,
              fontWeight: 700,
              fontSize: '1rem',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
              color: 'primary.main',
            }}
          >
            {nickname.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
              {nickname}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mt: 0.75 }}
              flexWrap="wrap"
            >
              <Rating
                value={score}
                size="small"
                readOnly
                sx={{
                  '& .MuiRating-iconFilled': { color: 'warning.main' },
                  '& .MuiRating-iconEmpty': { color: 'warning.main', opacity: 0.3 },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                {dateStr}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {review.content && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              lineHeight: 1.75,
              mb: images.length > 0 ? 1.5 : 0,
              fontWeight: 500,
            }}
          >
            {review.content}
          </Typography>
        )}

        {images.length > 0 && <MultiFilePreview files={images} />}

        {showAsset && review.asset && (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <Image
              src={review.asset.coverImage}
              alt=""
              sx={{ width: 52, height: 52, borderRadius: 1.5, objectFit: 'cover' }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ flex: 1, fontWeight: 600 }}
            >
              {review.asset.name}
            </Typography>
          </Stack>
        )}

        {review.replyContent && (
          <ReplyBlock>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
              商家回复
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.75, color: 'text.primary', lineHeight: 1.65, fontWeight: 500 }}
            >
              {review.replyContent}
            </Typography>
            {review.replyAt && (
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 1, color: 'text.disabled' }}
              >
                {new Date(review.replyAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            )}
          </ReplyBlock>
        )}
      </ReviewCardRoot>
    </FadeInBox>
  );
}
