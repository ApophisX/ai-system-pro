import { m } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { Scrollbar } from 'src/components/scrollbar';
import { MobileLayout } from 'src/components/custom/layout';

import { ReportForm } from '../report-form';

// ----------------------------------------------------------------------

type Props = {
  assetId: string;
};

export function ReportView({ assetId }: Props) {
  const router = useRouter();

  return (
    <MobileLayout appTitle="举报违规信息">
      <ReportForm assetId={assetId} />
    </MobileLayout>
  );
}
