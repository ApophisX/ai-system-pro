import { m } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Star, Info, Phone, Shield, MapPin, Calendar, MessageCircle } from 'lucide-react';

import {
  Box,
  Chip,
  Stack,
  Avatar,
  Button,
  Divider,
  Container,
  Typography,
  IconButton,
} from '@mui/material';

import { useMapBridge } from 'src/hooks/use-bridge';

import { Image } from 'src/components/image';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';
import { Lightbox, useLightbox } from 'src/components/lightbox';
import { AmountTypography } from 'src/components/custom/amount-typography';
import { FadeInBox, FadeInPaper, CurrencyTypography } from 'src/components/custom';
import { Carousel, useCarousel, CarouselArrowNumberButtons } from 'src/components/carousel';

import { RentalReviewSection } from 'src/sections/rental-review';

import { DELIVERY_METHOD_DICT, RENTAL_TYPE_UNIT_LABELS } from '../constants/rental-plan';

type Props = {
  assetDetail: MyApi.OutputAssetDetailDto;
};

export function RentalGoodsDetailContent({ assetDetail }: Props) {
  const carousel = useCarousel({ thumbs: { slidesToShow: 'auto' } });

  const slides = assetDetail.images?.map((img) => ({ src: img })) || [];

  const lightbox = useLightbox(slides);

  const { openLocation } = useMapBridge();

  const renderAmountLabel = (label: string, icon?: any) => (
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );

  return (
    <Container maxWidth="lg" sx={{ px: 0, pb: 3 }}>
      {/* 商品图片轮播 */}
      <Lightbox
        open={lightbox.open}
        close={lightbox.onClose}
        slides={slides}
        index={lightbox.selected}
        disableZoom
        disableFullscreen
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: true, preload: 1 }}
        animation={{ fade: 200 }}
      />
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          mb: 2,
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        <CarouselArrowNumberButtons
          {...carousel.arrows}
          options={carousel.options}
          totalSlides={carousel.dots.dotCount}
          selectedIndex={carousel.dots.selectedIndex + 1}
          sx={{ right: 16, bottom: 16, position: 'absolute' }}
        />
        <Carousel carousel={carousel}>
          {slides.map((slide, index) => (
            <Image
              key={slide.src}
              alt={slide.src}
              src={slide.src}
              ratio="1/1"
              onClick={() => lightbox.setSelected(index)}
              sx={{ cursor: 'zoom-in', minWidth: 320 }}
            />
          ))}
        </Carousel>
      </Box>

      {/* 商品基本信息卡片 */}
      <FadeInPaper
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 0,
          bgcolor: 'background.paper',
        }}
      >
        {/* 标签 */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {assetDetail.deposit === 0 && !assetDetail.isMallProduct && (
            <Chip
              icon={<Shield size={14} />}
              label="免押金"
              size="small"
              sx={{
                bgcolor: 'success.main',
                color: '#fff',
                fontWeight: 700,
                '& .MuiChip-icon': { color: '#fff' },
              }}
            />
          )}
          {assetDetail.customTags?.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>

        {/* 标题 */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 1.5,
            lineHeight: 1.3,
          }}
        >
          {assetDetail.name}
        </Typography>

        {/* 评分和距离 */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Star size={16} fill="#fbbf24" color="#fbbf24" />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {assetDetail.rating}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({assetDetail.reviewCount}条评价)
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <MapPin size={14} color="#9ca3af" />
            <Typography variant="caption" color="text.secondary">
              {assetDetail.contact.city}
              {assetDetail.contact.district}
              {assetDetail.contact.addressName}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {assetDetail.deliveryMethods.map((dm) => DELIVERY_METHOD_DICT[dm]).join('，')}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* 价格信息 */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {assetDetail.isMallProduct ? '商品价格' : '租赁方案'}
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {assetDetail.rentalPlans?.map((plan) => (
              <Stack
                key={plan.id}
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                  <Calendar size={18} color="#6366f1" />
                  <Typography variant="body2" color="text.secondary">
                    {plan.name}
                  </Typography>
                </Stack>
                <CurrencyTypography
                  color="error.main"
                  currency={plan.price}
                  endAdornment={
                    <Typography variant="body2" color="text.secondary">
                      {assetDetail.isMallProduct
                        ? ''
                        : `/${RENTAL_TYPE_UNIT_LABELS[plan.rentalType]}`}
                    </Typography>
                  }
                />
              </Stack>
            ))}
          </Stack>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              其他费用
            </Typography>
            <Stack spacing={1}>
              {!assetDetail.isMallProduct && (
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {renderAmountLabel('押金')}
                  {assetDetail.deposit > 0 ? (
                    <AmountTypography
                      color="error.main"
                      slotProps={{
                        amount: {
                          variant: 'h5',
                        },
                      }}
                      amount={assetDetail.deposit}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      免押金
                    </Typography>
                  )}
                </Stack>
              )}
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                {renderAmountLabel('运费')}
                {assetDetail.deliveryFee > 0 ? (
                  <AmountTypography
                    color="error.main"
                    slotProps={{
                      amount: {
                        variant: 'h5',
                      },
                    }}
                    amount={assetDetail.deliveryFee}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    免运费
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* {goodsDetail.originalPrice && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ textDecoration: 'line-through' }}
            >
              原价 ¥{goodsDetail.originalPrice}/天
            </Typography>
            <Chip
              label={`省¥${goodsDetail.originalPrice - goodsDetail.dailyPrice}/天`}
              size="small"
              sx={{
                bgcolor: 'error.lighter',
                color: 'error.main',
                fontWeight: 700,
                height: 20,
                fontSize: '0.65rem',
              }}
            />
          </Box>
        )} */}
      </FadeInPaper>

      {/* 联系地址 */}
      <FadeInPaper
        sx={{ p: 2.5, mb: 2, borderRadius: 0, bgcolor: 'background.paper' }}
        onClick={() => {
          openLocation({
            latitude: assetDetail.latitude,
            longitude: assetDetail.longitude,
            name: assetDetail.addressName,
            address: assetDetail.address,
          });
        }}
      >
        <HorizontalStack spacing={1}>
          <Iconify icon="mingcute:location-fill" width={14} height={14} />
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {assetDetail.contact.address}
          </Typography>
        </HorizontalStack>
      </FadeInPaper>

      {/* 商品详情 */}
      <FadeInPaper
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 0,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          商品详情
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {assetDetail.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          规格参数
        </Typography>
        <Stack spacing={1}>
          {assetDetail.specifications?.map((spec, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {spec.key}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {spec.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </FadeInPaper>

      {/* 商家信息 */}
      <FadeInPaper sx={{ p: 2.5, mb: 2, borderRadius: 0, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          商家信息
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
          <Avatar
            src={assetDetail.owner.avatar}
            sx={{
              width: 56,
              height: 56,
              border: '2px solid',
              borderColor: assetDetail.owner.isVerified ? 'primary.main' : 'divider',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {assetDetail.contactName}
              </Typography>
              {assetDetail.owner.isVerified ? (
                <Chip
                  label="已实名认证"
                  size="small"
                  sx={{ bgcolor: 'success.main', color: '#fff' }}
                />
              ) : (
                <Chip label="未实名认证" size="small" />
              )}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="custom:wechat-bold" width={16} height={16} />
              <Typography variant="body2" color="text.secondary">
                {assetDetail.contact.wechat}
              </Typography>
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(assetDetail.contact.wechat || '');
                  toast.success('复制成功', { id: 'copy-success' });
                }}
              >
                <Iconify icon="solar:copy-bold" width={14} height={14} />
              </IconButton>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 0.5 }}
              onClick={() => {
                openLocation({
                  latitude: assetDetail.latitude,
                  longitude: assetDetail.longitude,
                  name: assetDetail.addressName,
                  address: assetDetail.address,
                });
              }}
            >
              <Iconify icon="mingcute:location-fill" width={14} height={14} />
              <Box flex={1}>
                <Typography
                  component="div"
                  variant="caption"
                  color="text.secondary"
                  sx={[
                    (theme) => ({
                      ...theme.mixins.maxLine({ line: 1 }),
                    }),
                  ]}
                >
                  {assetDetail.addressName}
                </Typography>
                <Typography
                  component="div"
                  variant="caption"
                  color="text.secondary"
                  sx={[
                    (theme) => ({
                      ...theme.mixins.maxLine({ line: 1 }),
                    }),
                  ]}
                >
                  {assetDetail.address}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Phone size={18} />}
            sx={{ flex: 1 }}
            component="a"
            href={`tel:${assetDetail.contactPhone}`}
          >
            联系商家
          </Button>
          <Button
            variant="outlined"
            startIcon={<MessageCircle size={18} />}
            sx={{ flex: 1 }}
            href={`tel:${assetDetail.contactPhone}`}
            // onClick={() => {
            //   // TODO 跳转微信OR支付宝客服链接
            // }}
          >
            在线咨询
          </Button>
        </Stack>
      </FadeInPaper>

      {/* 租赁说明 */}
      <FadeInPaper sx={{ p: 2.5, mb: 2, borderRadius: 0, bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Info size={20} color="#6366f1" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {assetDetail.isMallProduct ? '商品说明' : '租赁说明'}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.8, mb: 2, whiteSpace: 'pre-wrap' }}
        >
          {assetDetail.notes}
        </Typography>
        {/* <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            • 最短租赁时间：{goodsDetail.minRentalDays}天
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 最长租赁时间：{goodsDetail.maxRentalDays}天
          </Typography>
          {goodsDetail.depositFree ? (
            <Typography variant="body2" color="text.secondary">
              • 免押金，芝麻信用分600以上即可
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              • 押金：¥{goodsDetail.deposit}（归还后3-7个工作日退还）
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            • 设备已全面消毒，可放心使用
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 支持同城闪送，运费需另付
          </Typography>
        </Stack> */}
      </FadeInPaper>

      {/* 图片详情 */}
      <FadeInBox
        sx={{
          mb: 2,
          borderRadius: 0,
          bgcolor: 'background.paper',
        }}
      >
        {assetDetail.detailImages?.map((img) => (
          <Image
            key={img}
            alt={img}
            src={img}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ))}
      </FadeInBox>

      {/* 用户评价 */}
      <RentalReviewSection assetId={assetDetail.id} />
    </Container>
  );
}
