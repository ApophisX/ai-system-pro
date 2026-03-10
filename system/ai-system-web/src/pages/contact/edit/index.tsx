'use client';

import { NewEditContactFormView } from 'src/sections/contact/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '新增/编辑联系人',
  description: '新增或编辑您的常用联系人',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <NewEditContactFormView />
    </>
  );
}
