import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';

import './tailwind.css';
import './app.less';
import { AppProvider } from './app-provider';
import { AuthProvider } from './auth/context';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.');
    console.log(APP_API_HOST);
    console.log(APP_URL);
  });

  // children 是将要会渲染的页面
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AuthProvider>{children}</AuthProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
