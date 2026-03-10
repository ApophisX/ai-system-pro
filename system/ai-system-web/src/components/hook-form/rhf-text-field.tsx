import type { TextFieldProps } from '@mui/material/TextField';

import { Controller, useFormContext } from 'react-hook-form';
import { transformValue, transformValueOnBlur, transformValueOnChange } from 'minimal-shared/utils';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export type RHFTextFieldProps = TextFieldProps & {
  name: string;
};

export function RHFTextField({
  name,
  helperText,
  slotProps,
  type = 'text',
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();

  const isNumberType = type === 'number';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const value = isNumberType ? transformValue(field.value || '') : field.value;
        return (
          <TextField
            {...field}
            fullWidth
            value={value}
            placeholder="请输入"
            onChange={(event) => {
              const transformedValue = isNumberType
                ? transformValueOnChange(event.target.value)
                : event.target.value;

              field.onChange(transformedValue);
            }}
            onBlur={(event) => {
              const transformedValue = isNumberType
                ? transformValueOnBlur(event.target.value)
                : event.target.value;

              field.onChange(transformedValue);
            }}
            type={isNumberType ? 'text' : type}
            error={!!error}
            helperText={error?.message ?? helperText}
            {...other}
            slotProps={{
              ...slotProps,
              inputLabel: slotProps?.inputLabel ?? { shrink: true },
              htmlInput: {
                ...(isNumberType && {
                  inputMode: 'decimal',
                  pattern: '[0-9]*\\.?[0-9]*',
                }),
                ...slotProps?.htmlInput,
                autoComplete: 'new-password', // Disable autocomplete and autofill
              },
            }}
          />
        );
      }}
    />
  );
}
