'use client';

import { m, AnimatePresence } from 'framer-motion';
import { Gift, Store, Users, Trophy } from 'lucide-react';
import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import {
  useGetMyRewards,
  useGetMyInviteCode,
  useGetMyInvitations,
  useGetMerchantInviteRank,
} from 'src/actions/merchant-invite';

import { Iconify } from 'src/components/iconify';
import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';
import { ListEmptyContent } from 'src/components/empty-content';

import { ForbiddenCard } from '../forbidden-card';
import {
  MerchantInviteCodeCard,
  MerchantInvitationListItem,
  MerchantInviteRankListItem,
  MerchantInviteRewardListItem,
} from '../components';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'code', label: '邀请码', icon: Store },
  { value: 'invitations', label: '邀请记录', icon: Users },
  { value: 'rewards', label: '我的奖励', icon: Gift },
  { value: 'rank', label: '排行榜', icon: Trophy },
] as const;

// ----------------------------------------------------------------------

export function MerchantInviteView() {
  const [currentTab, setCurrentTab] = useState<(typeof TABS)[number]['value']>('code');
  const [invitationsPage, setInvitationsPage] = useState(0);
  const [rewardsPage, setRewardsPage] = useState(0);
  const pageSize = 20;
  const invitationsPageRecordsRef = useRef<Record<number, any[]>>({});
  const rewardsPageRecordsRef = useRef<Record<number, any[]>>({});

  const {
    data: inviteCodeData,
    isPending: codeLoading,
    isError: codeError,
    error: codeErrorObj,
  } = useGetMyInviteCode();

  const { data: invitationsRes, isFetching: invitationsFetching } = useGetMyInvitations(
    invitationsPage,
    pageSize
  );
  const invitationsData = useMemo(() => invitationsRes?.data ?? [], [invitationsRes?.data]);
  const invitationsTotal = invitationsRes?.meta?.total ?? 0;

  const { data: rewardsRes, isFetching: rewardsFetching } = useGetMyRewards({
    page: rewardsPage + 1,
    pageSize,
  });
  const rewardsData = useMemo(() => rewardsRes?.data ?? [], [rewardsRes?.data]);
  const rewardsTotal = rewardsRes?.meta?.total ?? 0;

  const { data: rankData = [], isPending: rankLoading } = useGetMerchantInviteRank({
    period: 'monthly',
    limit: 50,
  });

  const [allInvitations, setAllInvitations] = useState<any[]>([]);
  const [allRewards, setAllRewards] = useState<any[]>([]);

  useEffect(() => {
    if (invitationsData.length > 0) {
      invitationsPageRecordsRef.current[invitationsPage] = invitationsData;
      const pages = Object.keys(invitationsPageRecordsRef.current)
        .map(Number)
        .sort((a, b) => a - b);
      setAllInvitations(pages.flatMap((p) => invitationsPageRecordsRef.current[p] ?? []));
    } else if (invitationsPage === 0) {
      setAllInvitations([]);
    }
  }, [invitationsData, invitationsPage]);

  useEffect(() => {
    if (rewardsData.length > 0) {
      rewardsPageRecordsRef.current[rewardsPage] = rewardsData;
      const pages = Object.keys(rewardsPageRecordsRef.current)
        .map(Number)
        .sort((a, b) => a - b);
      setAllRewards(pages.flatMap((p) => rewardsPageRecordsRef.current[p] ?? []));
    } else if (rewardsPage === 0) {
      setAllRewards([]);
    }
  }, [rewardsData, rewardsPage]);

  const invitationsHasMore =
    allInvitations.length < invitationsTotal && invitationsData.length === pageSize;
  const rewardsHasMore = allRewards.length < rewardsTotal && rewardsData.length === pageSize;

  const isForbidden = codeError && (codeErrorObj as any)?.response?.status === 403;

  return (
    <MobileLayout
      appTitle="商户邀请"
      appBarProps={{
        extra: (
          <Tabs
            value={currentTab}
            onChange={(_e, v) => setCurrentTab(v)}
            variant="fullWidth"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': { minHeight: 48 },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={<tab.icon size={18} />}
                iconPosition="start"
              />
            ))}
          </Tabs>
        ),
      }}
    >
      {isForbidden ? (
        <ForbiddenCard />
      ) : (
        <AnimatePresence mode="wait">
          {/* 邀请码 */}
          {currentTab === 'code' && (
            <Box
              component={m.div}
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MerchantInviteCodeCard data={inviteCodeData} loading={codeLoading} />
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 2,
                  px: 1,
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                当前阶段：邀请商户入驻，商户产生真实订单完成后您可获得分润奖励
              </Typography>
            </Box>
          )}

          {/* 邀请记录 */}
          {currentTab === 'invitations' && (
            <m.div
              key="invitations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {allInvitations.length === 0 && !invitationsFetching ? (
                  <ListEmptyContent
                    title="暂无邀请记录"
                    description="分享邀请码，邀请商户注册入驻"
                  />
                ) : (
                  <>
                    <Stack divider={<Divider variant="inset" />}>
                      {allInvitations.map((item, index) => (
                        <MerchantInvitationListItem key={item.id} item={item} index={index} />
                      ))}
                    </Stack>
                    <LoadMore
                      hasMore={invitationsHasMore}
                      loading={invitationsFetching}
                      onLoadMore={() => setInvitationsPage((p) => p + 1)}
                      disabled={codeLoading}
                      show={allInvitations.length >= pageSize}
                    />
                  </>
                )}
              </Card>
            </m.div>
          )}

          {/* 我的奖励 */}
          {currentTab === 'rewards' && (
            <m.div
              key="rewards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {allRewards.length === 0 && !rewardsFetching ? (
                  <ListEmptyContent
                    title="暂无奖励记录"
                    description="商户订单完成后，您将获得分润奖励"
                  />
                ) : (
                  <>
                    <Stack divider={<Divider variant="inset" />}>
                      {allRewards.map((item, index) => (
                        <MerchantInviteRewardListItem key={item.id} item={item} index={index} />
                      ))}
                    </Stack>
                    <LoadMore
                      hasMore={rewardsHasMore}
                      loading={rewardsFetching}
                      onLoadMore={() => setRewardsPage((p) => p + 1)}
                      disabled={codeLoading}
                      show={allRewards.length >= pageSize}
                    />
                  </>
                )}
              </Card>
            </m.div>
          )}

          {/* 排行榜 */}
          {currentTab === 'rank' && (
            <m.div
              key="rank"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.neutral' }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:cup-star-bold" width={20} color="warning.main" />
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                      月度拓展排行
                    </Typography>
                  </Stack>
                </Box>
                {rankLoading ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      加载中...
                    </Typography>
                  </Box>
                ) : rankData.length === 0 ? (
                  <ListEmptyContent title="暂无排行数据" description="邀请商户入驻，冲击榜单" />
                ) : (
                  <Stack divider={<Divider variant="inset" />}>
                    {rankData.map((item, index) => (
                      <MerchantInviteRankListItem key={item.employeeId} item={item} index={index} />
                    ))}
                  </Stack>
                )}
              </Card>
            </m.div>
          )}
        </AnimatePresence>
      )}
    </MobileLayout>
  );
}
