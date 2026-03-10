import 'src/global.css';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { DialogsProvider } from '@toolpad/core/useDialogs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Box } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { usePathname } from 'src/routes/hooks';

import { themeConfig, ThemeProvider } from 'src/theme';
import { AreaProvider } from 'src/layouts/global/area-provider';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { setSession, AuthProvider } from 'src/auth/context/jwt';

import { Snackbar } from './components/snackbar';
import { BackgroundBox } from './components/custom';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};
dayjs.locale('zh-cn');

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ children }: AppProps) {
  useScrollToTop();

  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const accessToken = urlSearchParams.get('access_token');
      const refreshToken = urlSearchParams.get('refresh_token');
      if (accessToken && refreshToken) {
        setSession(accessToken, refreshToken);
      }
      setIsCheckingSession(false);
    };
    setTimeout(checkSession, 350);
  }, []);
  if (isCheckingSession) {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        {/* <LoadingScreen color="primary" /> */}
      </Box>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AreaProvider>
          <SettingsProvider defaultSettings={defaultSettings}>
            <ThemeProvider
              modeStorageKey={themeConfig.modeStorageKey}
              defaultMode={themeConfig.defaultMode}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
                <DialogsProvider>
                  <MotionLazy>
                    <Snackbar />
                    <ProgressBar />
                    <SettingsDrawer defaultSettings={defaultSettings} />
                    {children}
                    <BackgroundBox />
                  </MotionLazy>
                </DialogsProvider>
              </LocalizationProvider>
            </ThemeProvider>
          </SettingsProvider>
        </AreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
