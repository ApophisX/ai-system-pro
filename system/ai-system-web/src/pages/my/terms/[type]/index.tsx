'use client';

import { useParams } from 'react-router';

import { TermsContentView } from 'src/sections/my/terms/view';

// ----------------------------------------------------------------------

const METADATA_MAP: Record<string, { title: string; description: string }> = {
  about: {
    title: '关于我们',
    description: '关于我们',
  },
  privacy: {
    title: '隐私政策',
    description: '隐私政策',
  },
  'user-agreement': {
    title: '用户协议',
    description: '用户协议',
  },
};

export default function Page() {
  const params = useParams<{ type: string }>();
  const type = params.type ?? 'about';
  const metadata = METADATA_MAP[type] ?? METADATA_MAP.about;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <TermsContentView />
    </>
  );
}
