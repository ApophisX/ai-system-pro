import type { AxiosResponse } from 'axios';
import type { ApiResponse } from 'src/lib/type';
import type { UserRole } from 'src/sections/my/types';

import { useQuery } from '@tanstack/react-query';
import { useRef, useMemo, useState, useEffect } from 'react';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import API from 'src/services/API';
import { withApiData } from 'src/lib/axios';

import { LoadMore } from 'src/components/custom/load-more';
import { MobileLayout } from 'src/components/custom/layout';

import { CreditSkeleton } from '../credit-skeleton';
import { useGetUserRole } from '../../hooks/use-role';
import {
  SectionTitle,
  CreditScoreCard,
  CreditPrivileges,
  CreditRecordItem,
  CreditEmptyState,
  LessorScoreCards,
  type PrivilegeItem,
} from '../components';

// ----------------------------------------------------------------------

type CreditAccount = MyApi.OutputCreditAccountDto;
type CreditRecord = MyApi.OutputCreditRecordDto;

// ----------------------------------------------------------------------

function useCreditData(actorRole: UserRole) {
  const [page, setPage] = useState(0);
  const pageRecordsRef = useRef<Record<number, CreditRecord[]>>({});
  const [allRecords, setAllRecords] = useState<CreditRecord[]>([]);
  const pageSize = 10;

  const { data: account, isPending: accountLoading } = useQuery({
    queryKey: ['credit-account', actorRole],
    queryFn: () => API.AppCredit.AppCreditControllerGetAccountV1({ actorRole }),
    select: (res) => res.data?.data,
  });

  const { data: recordsRes, isFetching: recordsFetching } = useQuery({
    queryKey: ['credit-records', actorRole, page],
    queryFn: async () => {
      const res = await API.AppCredit.AppCreditControllerGetRecordsV1({
        actorRole,
        page,
        pageSize,
      });
      return res.data;
    },
    select: (res) => ({ data: res?.data ?? [], meta: res?.meta }),
    placeholderData: (prev) => prev,
  });

  const recordsData = useMemo(() => recordsRes?.data ?? [], [recordsRes?.data]);
  const total = recordsRes?.meta?.total ?? 0;

  useEffect(() => {
    if (recordsData.length > 0) {
      pageRecordsRef.current[page] = recordsData;
      const pages = Object.keys(pageRecordsRef.current)
        .map(Number)
        .sort((a, b) => a - b);
      setAllRecords(pages.flatMap((p) => pageRecordsRef.current[p] ?? []));
    } else if (page === 0) {
      setAllRecords([]);
    }
  }, [recordsData, page]);

  const hasMore = allRecords.length < total && recordsData.length === pageSize;

  return {
    account,
    accountLoading,
    allRecords,
    recordsFetching,
    hasMore,
    pageSize,
    setPage,
  };
}

// ----------------------------------------------------------------------

function getPrivileges(role: UserRole, account: CreditAccount | undefined): PrivilegeItem[] {
  if (role === 'lessee') {
    return [
      {
        icon: 'solar:shield-check-bold',
        title: '免押租赁',
        desc: account?.depositFree ? '已开通' : '信用分≥700',
        enabled: !!account?.depositFree,
      },
      {
        icon: 'solar:clock-circle-bold',
        title: '极速审核',
        desc: '信用分≥650 享受优先审核',
        enabled: (account?.creditScore ?? 0) >= 650,
      },
      {
        icon: 'solar:bill-list-bold',
        title: '分期支付',
        desc: account?.installmentAllowed ? '已开通' : '信用分≥600',
        enabled: !!account?.installmentAllowed,
      },
    ];
  }
  return [
    {
      icon: 'solar:verified-check-bold',
      title: '信用展示',
      desc: '您的信用分将展示给承租方',
      enabled: true,
    },
    {
      icon: 'solar:dumbbell-large-minimalistic-bold',
      title: '资产稳定分',
      desc: `当前 ${account?.stabilityScore ?? 0} 分`,
      enabled: true,
    },
    {
      icon: 'solar:cup-star-bold',
      title: '评价优先',
      desc: '高信用获得更多曝光',
      enabled: true,
    },
  ];
}

// ----------------------------------------------------------------------

export default function CreditView() {
  const { userRole } = useGetUserRole();
  const { account, accountLoading, allRecords, recordsFetching, hasMore, pageSize, setPage } =
    useCreditData(userRole);

  const privileges = useMemo(() => getPrivileges(userRole, account), [userRole, account]);

  return (
    <MobileLayout appTitle="信用中心" containerProps={{ maxWidth: 'md', sx: { pb: 4 } }}>
        {accountLoading ? (
          <CreditSkeleton />
        ) : (
          <Stack spacing={3}>
            <CreditScoreCard account={account} role={userRole} />

            <CreditPrivileges privileges={privileges} />

            {userRole === 'lessor' && account && (
              <LessorScoreCards
                behaviorScore={account.behaviorScore}
                riskScore={account.riskScore}
                stabilityScore={account.stabilityScore}
              />
            )}

            <Box>
              <SectionTitle variant="subtitle1">信用记录</SectionTitle>
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {allRecords.length === 0 && !recordsFetching ? (
                  <CreditEmptyState />
                ) : (
                  <>
                    <Stack divider={<Divider variant="inset" />}>
                      {allRecords.map((record, index) => (
                        <CreditRecordItem key={record.id} record={record} index={index} />
                      ))}
                    </Stack>
                    <LoadMore
                      hasMore={hasMore}
                      loading={recordsFetching}
                      onLoadMore={() => setPage((p) => p + 1)}
                      disabled={accountLoading}
                      show={allRecords.length >= pageSize}
                    />
                  </>
                )}
              </Card>
            </Box>
          </Stack>
        )}
    </MobileLayout>
  );
}
