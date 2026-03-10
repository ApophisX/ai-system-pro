import { use } from 'react';

import { AreaContext } from '../area-context';

// ----------------------------------------------------------------------

export function useGetCurrentArea() {
  const context = use(AreaContext);

  if (!context) {
    throw new Error('useGetCurrentArea must be used inside AreaProvider');
  }

  return context;
}
