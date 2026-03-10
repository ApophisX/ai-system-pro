import { useState, useEffect, useCallback, useMemo } from 'react';

import { CONFIG } from 'src/global-config';

import { AreaContext, type AreaContextValue } from './area-context';

// ----------------------------------------------------------------------

const DEFAULT_AREA_STORAGE_KEY = 'defaultArea';

type AreaProviderProps = {
  children: React.ReactNode;
};

export function AreaProvider({ children }: AreaProviderProps) {
  const [currentArea, setCurrentAreaState] = useState(CONFIG.defaultArea);

  const setCurrentArea = useCallback((area: typeof CONFIG.defaultArea) => {
    setCurrentAreaState({ ...area });
    localStorage.setItem(DEFAULT_AREA_STORAGE_KEY, JSON.stringify(area));
  }, []);

  useEffect(() => {
    const storedArea = localStorage.getItem(DEFAULT_AREA_STORAGE_KEY);
    if (storedArea) {
      try {
        const parsedArea = JSON.parse(storedArea);
        setCurrentAreaState(parsedArea);
      } catch {
        // 如果解析失败，重置为默认值并清理 localStorage
        setCurrentArea(CONFIG.defaultArea);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const memoizedValue = useMemo<AreaContextValue>(
    () => ({
      currentArea,
      setCurrentArea,
    }),
    [currentArea, setCurrentArea]
  );

  return <AreaContext value={memoizedValue}>{children}</AreaContext>;
}
