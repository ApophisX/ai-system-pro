'use client';

import { useState } from 'react';

import { Box, Container } from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { PlatformDetector } from 'src/utils';

import { BottomNav } from 'src/sections/home/bottom-nav';

import { MessageTypeTab } from '../message-type-tab';
import { MessageListContent } from '../message-list-content';

// ----------------------------------------------------------------------

export function MessageView() {
  const searchParams = useSearchParams();
  const searchTab = searchParams.get('tab');
  const isInWeChatMiniProgram = PlatformDetector.isWeChatMiniProgram();

  const [currentTab, setCurrentTab] = useState(searchTab || 'all');

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <MessageTypeTab
        value={currentTab}
        onTabChange={setCurrentTab}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      />
      <Container
        maxWidth="lg"
        sx={{ pt: 6, pb: isInWeChatMiniProgram ? 3 : 12, px: 0, height: '100%' }}
      >
        <MessageListContent key={currentTab} messageType={currentTab} />
      </Container>
      <BottomNav />
    </Box>
  );
}
