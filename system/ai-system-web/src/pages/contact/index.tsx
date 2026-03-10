'use client';

import { ContactListView } from 'src/sections/contact/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '常用联系人',
  description: '管理您的常用联系人，方便快速选择',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <ContactListView />
    </>
  );
}
