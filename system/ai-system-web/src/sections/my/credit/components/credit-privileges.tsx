import type { IconifyName } from 'src/components/iconify';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { HorizontalStack } from 'src/components/custom/layout';

import { SectionTitle, PrivilegeCard, PrivilegeIconWrap } from './credit-styled';

// ----------------------------------------------------------------------

export type PrivilegeItem = {
  icon: IconifyName;
  title: string;
  desc: string;
  enabled: boolean;
};

type Props = {
  privileges: PrivilegeItem[];
};

export function CreditPrivileges({ privileges }: Props) {
  return (
    <Box>
      <SectionTitle variant="subtitle1">信用特权</SectionTitle>
      <HorizontalStack alignItems="stretch">
        {privileges.map((item, index) => (
          <Box
            key={item.title}
            component={m.div}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            flex={1}
            sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <PrivilegeCard
              variant={item.enabled ? 'outlined' : undefined}
              enabled={item.enabled}
              sx={{ flex: 1, minHeight: 0 }}
            >
              <PrivilegeIconWrap enabled={item.enabled}>
                <Iconify icon={item.icon} width={22} />
              </PrivilegeIconWrap>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.desc}
              </Typography>
            </PrivilegeCard>
          </Box>
        ))}
      </HorizontalStack>
    </Box>
  );
}
