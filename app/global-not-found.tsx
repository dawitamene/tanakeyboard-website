import type { Metadata } from 'next';
import { PageView } from '@/components/PageView';
import { RootDocument } from '@/components/RootDocument';
import { pageByPath } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

const notFoundPage = () => {
  const page = pageByPath('/404');
  if (!page) throw new Error('content/pages/404.html is missing');
  return page;
};

export const metadata: Metadata = pageMetadata(notFoundPage());

export default function GlobalNotFound() {
  return (
    <RootDocument lang="en">
      <PageView page={notFoundPage()} />
    </RootDocument>
  );
}
