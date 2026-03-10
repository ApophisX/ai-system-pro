import { m } from 'framer-motion';

import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { EmptyIconWrap, EmptyStateRoot } from './credit-styled';

export function CreditEmptyState() {
  return (
    <Box component={m.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <EmptyStateRoot>
        <EmptyIconWrap>
          <Iconify icon="solar:bill-list-bold" width={40} sx={{ color: 'text.disabled' }} />
        </EmptyIconWrap>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          暂无信用记录
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
          完成订单、按时归还等行为将影响信用分
        </Typography>
      </EmptyStateRoot>
    </Box>
  );
}
