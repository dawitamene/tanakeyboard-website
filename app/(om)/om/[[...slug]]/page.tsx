import type { Metadata } from 'next';
import { PageView } from '@/components/PageView';
import { prefixedParams, pageForSlug } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return prefixedParams('/om');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMetadata(pageForSlug('/om', (await params).slug));
}

export default async function OromoPage({ params }: Props) {
  return <PageView page={pageForSlug('/om', (await params).slug)} />;
}
