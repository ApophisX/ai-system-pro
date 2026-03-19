import { MessageCircle } from 'lucide-react';
import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';

import { Box, Stack, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { usePlatform } from 'src/hooks/use-platform';

import API from 'src/services/API';
import { useGetMessages } from 'src/actions/message';

import { LoadMore } from 'src/components/custom';
import { PullingContent } from 'src/components/custom/pull-to-refresh-loading';

import { useAuthContext } from 'src/auth/hooks';

import { MessageCard, MessageCardSkeleton } from './components';

type Props = { messageType: string };
export function MessageListContent({ messageType }: Props) {
  const router = useRouter();

  const { user } = useAuthContext();

  const { isInWeChatMiniProgram } = usePlatform();

  const {
    allData: messages,
    dataLoading,
    isFirstDataLoading,
    hasMore,
    dataValidating,
    loadMore,
    reload,
    mutate,
  } = useGetMessages({
    type: messageType === 'all' ? undefined : (messageType as any),
  });
  const queryClient = useQueryClient();

  // 本地追踪已读消息 ID，解决分页场景下 mutate 只更新当前页缓存导致小红点不消失的问题
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(() => new Set());

  // 标记消息为已读
  const handleMessageClick = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      const {
        orderid: orderId,
        id,
        isunread,
        lessorid: lessorId,
        lesseeid: lesseeId,
      } = event.currentTarget.dataset;
      if (id && isunread === 'true') {
        // 立即更新本地状态，让小红点立刻消失
        setReadMessageIds((prev) => new Set(prev).add(id));
        queryClient.invalidateQueries({ queryKey: ['message-status-tabs', messageType] });
        queryClient.invalidateQueries({ queryKey: ['unread-message-count', messageType] });
        API.AppMessage.AppMessageControllerUpdateV1(
          { id },
          { status: 'READ' },
          { fetchOptions: { showSuccess: false } }
        );
        mutate(
          (prev) => ({
            ...prev,
            data:
              prev?.data?.map((msg) =>
                msg.id === id ? { ...msg, isUnread: false, status: 'READ' } : msg
              ) ?? [],
          }),
          {
            revalidate: false,
          }
        );
      }
    },
    [messageType, mutate, queryClient]
  );

  // 骨架屏
  const renderSkeletons = (
    <Stack spacing={2}>
      {[...Array(10)].map((_, index) => (
        <MessageCardSkeleton key={index} />
      ))}
    </Stack>
  );

  // 空状态
  const renderEmpty = (
    <Stack alignItems="center" justifyContent="center" sx={{ height: '70vh', textAlign: 'center' }}>
      <Box sx={{ color: 'text.disabled', mb: 2 }}>
        <MessageCircle size={64} />
      </Box>
      <Typography variant="h6" sx={{ color: 'text.secondary' }}>
        暂无消息
      </Typography>
    </Stack>
  );

  const handleRefresh = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['message-status-tabs', messageType] });
    queryClient.invalidateQueries({ queryKey: ['unread-message-count', messageType] });
    await reload();
  }, [queryClient, reload, messageType]);

  // 消息列表
  const renderList = (
    <Stack spacing={1.5} px={2} py={2}>
      {messages.map((msg, index) => {
        const isUnread = readMessageIds.has(msg.id) ? false : msg.isUnread;
        return (
          <MessageCard
            data-isunread={isUnread}
            data-id={msg.id}
            data-lessorid={msg.extra?.lessorId}
            data-lesseeid={msg.extra?.lesseeId}
            data-orderid={msg.extra?.orderId}
            data-type={msg.type}
            key={msg.id}
            msg={{ ...msg, isUnread }}
            index={index}
            onClick={handleMessageClick}
          />
        );
      })}

      <LoadMore
        hasMore={hasMore}
        loading={dataValidating}
        onLoadMore={loadMore}
        disabled={isFirstDataLoading || dataLoading}
        show={messages.length > 0}
      />
    </Stack>
  );
  return (
    <>
      {isFirstDataLoading ? (
        renderSkeletons
      ) : (
        <PullToRefresh
          maxPullDownDistance={200}
          pullDownThreshold={100}
          resistance={2}
          pullingContent={<PullingContent sx={{ py: 2 }} />}
          onRefresh={handleRefresh}
        >
          <AnimatePresence mode="wait">
            {messages.length > 0 ? renderList : renderEmpty}
          </AnimatePresence>
        </PullToRefresh>
      )}
    </>
  );
}
