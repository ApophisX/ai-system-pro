import { Box } from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { MobileLayout } from 'src/components/custom/layout';

import { ContactListContent } from '../contact-list-content';

export const ContactListView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <MobileLayout appTitle="常用联系人" containerProps={{ sx: { p: 0 } }}>
      <ContactListContent useScrollbar={false} />
    </MobileLayout>
  );
};
