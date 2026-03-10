import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { fDateTime } from 'src/utils';

import { Iconify } from 'src/components/iconify';

import { RecordItemRoot, RecordIconWrap } from './credit-styled';

type Props = {
  record: MyApi.OutputCreditRecordDto;
  index: number;
};

export function CreditRecordItem({ record, index }: Props) {
  const isPositive = record.impactScore >= 0;

  return (
    <Box
      component={m.div}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
    >
      <RecordItemRoot>
        <ListItemIcon sx={{ minWidth: 48 }}>
          <RecordIconWrap isPositive={isPositive}>
            <Iconify
              icon={isPositive ? 'solar:verified-check-bold' : 'solar:danger-triangle-bold'}
              width={20}
            />
          </RecordIconWrap>
        </ListItemIcon>
        <ListItemText
          primary={record.eventTypeLabel}
          secondary={fDateTime(record.createdAt)}
          slotProps={{
            primary: { variant: 'subtitle2', fontWeight: 600 },
            secondary: { variant: 'caption' },
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: isPositive ? 'success.main' : 'error.main' }}
        >
          {isPositive ? '+' : ''}
          {record.impactScore}
        </Typography>
      </RecordItemRoot>
    </Box>
  );
}
