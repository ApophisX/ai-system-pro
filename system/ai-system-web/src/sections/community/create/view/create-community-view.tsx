import { MobileLayout } from 'src/components/custom/layout';

import { CreateCommunityFormContent } from '../create-community-form-content';

// ----------------------------------------------------------------------

export function CreateCommunityView() {
  return (
    <MobileLayout appTitle="创建社区">
      <CreateCommunityFormContent />
    </MobileLayout>
  );
}
