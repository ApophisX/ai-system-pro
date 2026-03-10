import { Box, Container, Stack } from '@mui/material';

import { useParams } from 'src/routes/hooks';

import { Scrollbar } from 'src/components/scrollbar';
import { MyAppBar } from 'src/components/custom/my-app-bar';

import { NewEditContactFormContent } from '../new-edit-contact-form-content';

export const NewEditContactFormView = () => {
  const params = useParams();
  const contactId = params.id as string | undefined;
  const isEditMode = !!contactId;

  return (
    <Stack sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* 固定顶部导航栏 */}
      <MyAppBar
        appTitle={isEditMode ? '编辑联系人' : '新增联系人'}
        sx={{ position: 'sticky', top: 0 }}
      />
      {/* 内容区域 */}
      <Scrollbar sx={{ flex: 1, py: 2 }}>
        <Container maxWidth="sm">
          <NewEditContactFormContent />
        </Container>
      </Scrollbar>
    </Stack>
  );
};
