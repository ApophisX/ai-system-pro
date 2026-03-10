'use client';

import { useState } from 'react';

import { useSearchParams } from 'src/routes/hooks';

import { MobileLayout } from 'src/components/custom/layout';

import { MessageTypeTab } from '../message-type-tab';
import { MessageListContent } from '../message-list-content';

// ----------------------------------------------------------------------

export function MessageCenterView() {
  const searchParams = useSearchParams();
  const searchTab = searchParams.get('tab');

  const [currentTab, setCurrentTab] = useState(searchTab || 'all');

  return (
    <MobileLayout
      appTitle="消息中心"
      appBarProps={{
        extra: <MessageTypeTab value={currentTab} onTabChange={setCurrentTab} />,
      }}
      containerProps={{
        sx: { px: 0, pt: 0 },
      }}
    >
      <MessageListContent key={currentTab} messageType={currentTab} />
    </MobileLayout>
  );
}
