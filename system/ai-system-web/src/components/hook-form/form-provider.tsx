import type { UseFormReturn } from 'react-hook-form';

import { FormProvider as RHFForm } from 'react-hook-form';

// ----------------------------------------------------------------------

export type FormProps = {
  onSubmit?: () => void;
  className?: string;
  children: React.ReactNode;
  methods: UseFormReturn<any>;
};

export function Form({ children, onSubmit, methods, className }: FormProps) {
  return (
    <RHFForm {...methods}>
      <form onSubmit={onSubmit} noValidate autoComplete="off" className={className}>
        {children}
      </form>
    </RHFForm>
  );
}
