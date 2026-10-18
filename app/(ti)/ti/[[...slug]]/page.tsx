import type { Metadata } from 'next';
import { PageView } from '@/components/PageView';
import { prefixedParams, pageForSlug } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return prefixedParams('/ti');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMetadata(pageForSlug('/ti', (await params).slug));
}

export default async function TigrinyaPage({ params }: Props) {
  return <PageView page={pageForSlug('/ti', (await params).slug)} />;
}
