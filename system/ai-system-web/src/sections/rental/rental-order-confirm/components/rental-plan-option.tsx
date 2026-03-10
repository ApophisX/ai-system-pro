import { Box, Radio, Stack, Typography } from '@mui/material';

import { CurrencyTypography } from 'src/components/custom';

import { RENTAL_TYPE_UNIT_LABELS } from '../../constants/rental-plan';

// ----------------------------------------------------------------------

interface RentalPlanOptionProps {
  plan: MyApi.OutputAssetRentalPlanDto;
  isSelected: boolean;
  value: number;
  isMallProduct: boolean;
}

export function RentalPlanOption({
  plan,
  isSelected,
  value,
  isMallProduct,
}: RentalPlanOptionProps) {
  return (
    <Box
      component="label"
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 2,
        px: 2,
        borderRadius: 2,
        border: (theme) =>
          `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: isSelected ? 'background.default' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'background.default',
        },
      }}
    >
      {plan.isInstallment && (
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: 'secondary.main',
            color: '#fff',
            px: 2,
            py: 0.5,
            borderTopRightRadius: (theme) => theme.shape.borderRadius,
            borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
            zIndex: 12,
            fontSize: 12,
          }}
        >
          {plan.rentalPeriod}期
        </Box>
      )}
      <Radio value={value} sx={{ display: 'none' }} />
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={[
            (theme) => ({
              fontWeight: 700,
              ...theme.mixins.maxLine({ line: 1 }),
            }),
          ]}
        >
          {plan.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
          <CurrencyTypography
            fontSize={24}
            currency={plan.price}
            endAdornment={
              <Typography variant="body2" color="text.secondary">
                {isMallProduct ? '' : `/${RENTAL_TYPE_UNIT_LABELS[plan.rentalType]}`}
              </Typography>
            }
          />
        </Stack>
      </Box>
    </Box>
  );
}
