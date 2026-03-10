import { useParams } from 'react-router';

import Box from '@mui/material/Box';

import { useRouter } from 'src/routes/hooks';

import { MobileLayout } from 'src/components/custom/layout';

// ----------------------------------------------------------------------

const TERMS_TYPE_MAP: Record<string, { title: string; src: string }> = {
  about: {
    title: '关于我们',
    src: '/terms/about.html',
  },
  privacy: {
    title: '隐私政策',
    src: '/terms/privacy.html',
  },
  'user-agreement': {
    title: '用户协议',
    src: '/terms/user-agreement.html',
  },
};

export function TermsContentView() {
  const router = useRouter();
  const params = useParams<{ type: string }>();
  const type = params.type ?? 'about';
  const config = TERMS_TYPE_MAP[type] ?? TERMS_TYPE_MAP.about;

  return (
    <MobileLayout
      appTitle={config.title}
      appBarProps={{ onBack: () => router.back() }}
      containerProps={{
        sx: {
          p: 0,
          height: 'calc(100vh - 56px)',
          maxWidth: '100%',
        },
      }}
    >
      <Box
        component="iframe"
        src={config.src}
        title={config.title}
        sx={{
          width: '100%',
          height: 'calc(100vh - 56px)',
          border: 'none',
          display: 'block',
        }}
      />
    </MobileLayout>
  );
}
