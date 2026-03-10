/**
 * 消息中心 - 页面视图
 * 纯 UI 展示，使用模拟数据
 */

import { useState, useCallback } from 'react';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import {
  MessageTypeTab,
  MessageCard,
  MessageCardSkeleton,
  MessageListEmpty,
  MESSAGE_PATHS,
  MOCK_UNREAD_COUNT,
} from '@/sections/message/components';
import { useGetMessages } from '@/actions/message';

export function MessageView() {
  const [currentTab, setCurrentTab] = useState('all');

  const {
    allData: messages,
    dataLoading,
    isFirstDataLoading,
    hasMore,
    loadMore,
    reload,
  } = useGetMessages({
    type: currentTab === 'all' ? undefined : (currentTab as any),
  });

  const statusCount = MOCK_UNREAD_COUNT;
  const totalCount = statusCount.system + statusCount.order;

  const handleMessageClick = useCallback((msg: MyApi.OutputMessageDto) => {
    const orderId = msg.extra?.orderId as string | undefined;
    if (orderId) {
      Taro.navigateTo({
        url: MESSAGE_PATHS.my.orderDetail(orderId),
      }).catch(() => {});
    }
  }, []);

  usePullDownRefresh(async () => {
    reload();
    Taro.stopPullDownRefresh();
  });

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col" style={{ height: '100vh' }}>
      <View className="bg-white safe-area-top sticky top-0 z-50">
        <MessageTypeTab
          value={currentTab}
          onTabChange={setCurrentTab}
          statusCount={statusCount}
          totalCount={totalCount}
        />
      </View>

      <ScrollView
        style={{ height: 400 }}
        className="flex-1"
        enableFlex
        scrollY
        enhanced
        showScrollbar={false}
        enableBackToTop
        onScrollToLower={loadMore}
      >
        {isFirstDataLoading && messages.length === 0 ? (
          <View>
            {[1, 2, 3, 4, 5].map(i => (
              <MessageCardSkeleton key={i} />
            ))}
          </View>
        ) : messages.length === 0 ? (
          <MessageListEmpty />
        ) : (
          <View>
            {messages.map(msg => (
              <MessageCard key={msg.id} msg={msg} onClick={() => handleMessageClick(msg)} />
            ))}
          </View>
        )}
        <View className="flex items-center justify-center py-4 text-gray-500 text-sm">
          {dataLoading ? (
            <Text>正在加载更多...</Text>
          ) : !hasMore && messages.length > 0 ? (
            <Text>没有更多了</Text>
          ) : null}
        </View>
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
