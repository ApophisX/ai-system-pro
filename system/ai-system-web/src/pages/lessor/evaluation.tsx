'use client';

import LessorEvaluationView from 'src/sections/lessor/evaluation/view/lessor-evaluation-view';

// ----------------------------------------------------------------------

const metadata = {
  title: '评价管理',
  description: '查看我收到的评价',
};

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <LessorEvaluationView />
    </>
  );
}
