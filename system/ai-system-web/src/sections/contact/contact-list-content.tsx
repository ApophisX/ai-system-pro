import { m } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useDialogs } from '@toolpad/core/useDialogs';
import PullToRefresh from 'react-simple-pull-to-refresh';

import { Box, Paper, Stack, Button, Container, Typography } from '@mui/material';

import API from 'src/services/API';
import { useGetContactList } from 'src/actions/contact';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadMore } from 'src/components/custom/load-more';
import { LoadingScreen } from 'src/components/loading-screen';
import { MyConfirmDialog } from 'src/components/custom/confirm-dialog';
import { PullingContent } from 'src/components/custom/pull-to-refresh-loading';

import { NewEditContactDrawer } from './new-edit-contact-drawer';
import { ContactCard, ContactCardActionMenu, useContactCardMoreClick } from './contact-card';

// ----------------------------------------------------------------------

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
  createdAt: string;
}

// ----------------------------------------------------------------------

type ContactListContentProps = {
  checkedId?: string;
  onSelect?: (contact: MyApi.OutputContactDto) => void;
  useScrollbar?: boolean;
};
export function ContactListContent(props: ContactListContentProps) {
  const { onSelect, checkedId, useScrollbar = true } = props;

  const [page, setPage] = useState(0);

  const { targetContact, handleMoreClick, popover } = useContactCardMoreClick();

  const dialogs = useDialogs();

  const {
    allData: contacts,
    clearCache,
    dataLoading,
    isFirstDataLoading,
    dataValidating,
    hasMore,
    mutate,
  } = useGetContactList({ page });

  const { onClose: hidePopover } = popover;

  const handleReload = useCallback(async () => {
    if (page > 0) {
      clearCache();
      setPage(0);
    } else {
      await mutate?.();
    }
  }, [page, clearCache, mutate]);

  // 编辑联系人
  const handleEdit = useCallback(() => {
    hidePopover();
    if (!targetContact) return;
    dialogs.open(
      NewEditContactDrawer,
      { data: targetContact },
      {
        onClose: async (result) => {
          if (result) {
            mutate();
          }
        },
      }
    );
  }, [hidePopover, targetContact, dialogs, mutate]);

  // 删除联系人
  const handleDeleteConfirm = useCallback(() => {
    hidePopover();
    if (!targetContact) return;
    dialogs.open(MyConfirmDialog, {
      onOk: async () => {
        await API.AppContact.AppContactControllerDeleteContactV1({ id: targetContact.id });
        handleReload();
      },
    });
  }, [hidePopover, targetContact, dialogs, handleReload]);

  // 设置默认联系人
  const handleSetDefault = useCallback(async () => {
    hidePopover();
    if (!targetContact) return;
    await API.AppContact.AppContactControllerSetDefaultContactV1({ id: targetContact.id });
    handleReload();
  }, [targetContact, hidePopover, handleReload]);

  // 初始加载状态
  if (isFirstDataLoading) {
    return <LoadingScreen />;
  }

  const renderEmpty = () => (
    <Paper
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 2,
        boxShadow: (theme) => theme.vars.customShadows.card,
      }}
    >
      <Iconify
        icon="mingcute:location-fill"
        width={64}
        height={64}
        sx={{ color: 'text.disabled', mb: 2 }}
      />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
        暂无联系人
      </Typography>
      <Typography variant="body2" color="text.disabled">
        点击按钮添加您的第一个联系人
      </Typography>
    </Paper>
  );

  const renderContent = () => (
    <PullToRefresh
      maxPullDownDistance={200}
      pullDownThreshold={100}
      resistance={2}
      pullingContent={<PullingContent />}
      onRefresh={handleReload}
    >
      {contacts.length === 0 ? (
        renderEmpty()
      ) : (
        <Stack spacing={2} flex={1} px={2} pt={2} pb={4}>
          {contacts.map((contact, index) => (
            <ContactCard
              checked={checkedId === contact.id}
              key={contact.id}
              data={contact}
              onSelect={onSelect}
              onMoreClick={handleMoreClick}
            />
          ))}
        </Stack>
      )}

      {/* 加载更多触发器 */}
      <LoadMore
        hasMore={hasMore}
        loading={dataValidating}
        onLoadMore={() => setPage((prev) => prev + 1)}
        disabled={dataLoading}
        show={contacts.length > 0 && contacts.length >= 10}
      />
    </PullToRefresh>
  );

  return (
    <>
      <ContactCardActionMenu
        popover={popover}
        targetContact={targetContact}
        onEdit={handleEdit}
        onSetDefault={handleSetDefault}
        onDelete={handleDeleteConfirm}
      />

      {useScrollbar ? (
        <Scrollbar sx={{ flex: 1, bgcolor: 'background.default' }}>{renderContent()}</Scrollbar>
      ) : (
        <>
          {renderContent()}
          <Box sx={{ height: 120 }} />
        </>
      )}

      {/* 添加新联系人按钮 */}
      <Container
        sx={{
          position: useScrollbar ? undefined : 'fixed',
          py: 3,
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
        }}
      >
        <Button
          component={m.button}
          whileTap={{ scale: 0.98 }}
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<Iconify icon="mingcute:add-line" width={20} height={20} />}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
          onClick={() => {
            dialogs.open(
              NewEditContactDrawer,
              {},
              {
                onClose: async (result) => {
                  if (result) {
                    handleReload();
                  }
                },
              }
            );
          }}
        >
          添加新联系人
        </Button>
      </Container>
    </>
  );
}
