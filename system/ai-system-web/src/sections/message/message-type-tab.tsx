import type { TabsProps } from '@mui/material';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Tab, Tabs, Badge, Stack } from '@mui/material';

import API from 'src/services/API';
import { MESSAGE_EVENT_NAME } from 'src/constants';

import { Iconify } from 'src/components/iconify';

type Props = TabsProps & {
  onTabChange: (value: string) => void;
};
export function MessageTypeTab({ onTabChange, ...props }: Props) {
  const { data: statusCount, refetch } = useQuery({
    queryKey: ['message-status-tabs'],
    queryFn: () => API.AppMessage.AppMessageControllerGetUnreadCountByTypeV1(),
    select: (res) => res.data?.data ?? {},
    gcTime: 0,
    staleTime: 0,
  });

  const { data: totalCount } = useQuery({
    queryKey: ['unread-message-count'],
    queryFn: () => API.AppMessage.AppMessageControllerGetUnreadCountV1({ type: '' }),
    select: (res) => res.data?.data ?? 0,
    gcTime: 0,
    staleTime: 0,
  });

  const messageStatusTabs = useMemo(() => {
    const tabs = [
      { value: 'all', label: '全部', icon: 'solar:chat-round-dots-bold', count: totalCount ?? 0 },
      {
        value: 'SYSTEM',
        label: '通知',
        icon: 'solar:bell-bing-bold-duotone',
        count: statusCount?.system ?? 0,
      },
      {
        value: 'ORDER',
        label: '订单',
        icon: 'solar:notebook-bold-duotone',
        count: statusCount?.order ?? 0,
      },
    ];

    return tabs;
  }, [statusCount?.order, statusCount?.system, totalCount]);

  // 切换标签
  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      onTabChange(newValue);
      const params = new URLSearchParams(window.location.search);
      if (newValue === 'all') {
        params.delete('tab');
      } else {
        params.set('tab', newValue);
      }
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
      window.dispatchEvent(new CustomEvent(MESSAGE_EVENT_NAME.REFRESH_MESSAGE_STATUS_TABS));
      refetch();
    },
    [onTabChange, refetch]
  );
  return (
    <Tabs
      {...props}
      onChange={handleChangeTab}
      variant="fullWidth"
      sx={{
        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
        ...props.sx,
        bgcolor: 'background.paper',
      }}
    >
      {messageStatusTabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon={tab.icon as any} width={20} />
              <Badge
                badgeContent={tab.count}
                color="error"
                slotProps={{ badge: { sx: { right: -10 } } }}
              >
                {tab.label}
              </Badge>
            </Stack>
          }
        />
      ))}
    </Tabs>
  );
}
