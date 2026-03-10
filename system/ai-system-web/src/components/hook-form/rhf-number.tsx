import { useController, useFormContext } from 'react-hook-form';

import { Box, Stack, Button, Typography, InputAdornment } from '@mui/material';

import { Field } from './fields';
import { Iconify } from '../iconify';

type RHFNumberProps = {
  name: string;
  label: string;
  min: number;
  max: number;
  unit?: string;
  disabled?: boolean;
};
export function RHFNumber({
  name,
  label,
  min = 1,
  max = 9999,
  unit = '',
  disabled = false,
}: RHFNumberProps) {
  const { control, setValue } = useFormContext();
  const { field } = useController({ name, control });
  return (
    <Stack direction="row" alignItems="stretch" spacing={1}>
      <Button
        variant="soft"
        disabled={field.value <= min || disabled}
        onClick={() => {
          setValue(name, field.value > min ? field.value - 1 : field.value);
        }}
      >
        <Iconify icon="mingcute:minimize-line" />
      </Button>
      <Box flex={1}>
        <Field.Text
          name={name}
          type="tel"
          label={label}
          slotProps={{
            input: {
              inputProps: {
                maxLength: String(max).length,
                style: { textAlign: 'center', fontWeight: 700, fontSize: 18 },
              },
              // startAdornment: (
              //   <InputAdornment position="start">
              //     <Iconify icon="solar:clock-circle-outline" />
              //   </InputAdornment>
              // ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="subtitle1">{unit}</Typography>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Button
        variant="soft"
        disabled={field.value >= max || disabled}
        onClick={() => {
          const value = field.value + 1;
          setValue(name, value > max ? max : value);
        }}
      >
        <Iconify icon="mingcute:add-line" />
      </Button>
    </Stack>
  );
}
