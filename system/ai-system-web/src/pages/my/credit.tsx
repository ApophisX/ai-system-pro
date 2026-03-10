import { CreditView } from 'src/sections/my/credit/view';

// ----------------------------------------------------------------------

const metadata = {
  title: '信用中心',
  description: '信用中心 - 查看我的信用分、信用记录和特权',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <CreditView />
    </>
  );
}
