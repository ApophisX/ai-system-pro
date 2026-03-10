import type { BoxProps } from '@mui/material/Box';

import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const termsLabel = (
  <Box component="span" sx={{ color: 'text.secondary' }}>
    我已阅读并同意
    <Link
      underline="always"
      color="success"
      href={paths.my.terms.userAgreement}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ mx: 0.25 }}
    >
      《服务条款》
    </Link>
    及
    <Link
      underline="always"
      color="success"
      href={paths.my.terms.privacy}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ mx: 0.25 }}
    >
      《隐私政策》
    </Link>
  </Box>
);

type SignUpTermsProps = BoxProps & {
  /** 勾选后才能注册，需作为表单项使用（必须位于 Form 内） */
  name?: string;
};

export function SignUpTerms({ name = 'agreeTerms', sx, ...other }: SignUpTermsProps) {
  const { control } = useFormContext();

  return (
    <Box
      component="div"
      sx={[
        () => ({
          mt: 2,
          display: 'block',
          textAlign: 'left',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Box>
            <FormControlLabel
              control={
                <Checkbox {...field} checked={!!field.value} color="success" sx={{ py: 0.5 }} />
              }
              label={termsLabel}
              sx={{
                alignItems: 'center',
                mx: 0,
                ml: -1,
                ...(error && { color: 'error.main' }),
              }}
            />
            {error?.message && (
              <FormHelperText error sx={{ textAlign: 'center', mx: 0 }}>
                {error.message}
              </FormHelperText>
            )}
          </Box>
        )}
      />
    </Box>
  );
}
