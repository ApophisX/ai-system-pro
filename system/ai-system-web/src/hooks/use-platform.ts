import { useEffect, useMemo, useState } from 'react';

import { PlatformDetector } from 'src/utils';

export const usePlatform = () => {
  const [platformState, setPlatformState] = useState({
    isInWeChatMiniProgram: true,
  });
  useEffect(() => {
    const isInWeChatMiniProgram = PlatformDetector.isWeChatMiniProgram();
    setPlatformState({
      isInWeChatMiniProgram,
    });
  }, []);
  return platformState;
};
