import { HelpView } from 'src/sections/my/help/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '帮助中心',
  description: '帮助中心 - 常见问题解答和客服联系',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <HelpView />
    </>
  );
}
