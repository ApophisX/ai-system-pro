'use client';

import { ProfileEditView } from 'src/sections/my/profile-edit/view';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = {
  title: '编辑资料',
  description: '编辑个人资料 - 修改头像、昵称、性别、简介等信息',
};

export default function Page() {
  const { user } = useAuthContext();
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {user && <ProfileEditView user={user} />}
    </>
  );
}

