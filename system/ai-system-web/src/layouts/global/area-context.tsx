import type { ConfigValue } from 'src/global-config';

import { createContext } from 'react';

// ----------------------------------------------------------------------

export type AreaContextValue = {
  currentArea: ConfigValue['defaultArea'];
  setCurrentArea: (area: ConfigValue['defaultArea']) => void;
};

export const AreaContext = createContext<AreaContextValue | undefined>(undefined);
