import { useEffect } from 'react';

import { ORDER_EVENT_NAME } from 'src/constants';

export function useRefreshOrder({ mutate }: { mutate: () => void }) {
  useEffect(() => {
    window.addEventListener(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, mutate);
    return () => {
      window.removeEventListener(ORDER_EVENT_NAME.REFRESH_RENTAL_ORDER, mutate);
    };
  }, [mutate]);
}
