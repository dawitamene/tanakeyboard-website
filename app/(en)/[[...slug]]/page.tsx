import type { Metadata } from 'next';
import { PageView } from '@/components/PageView';
import { englishParams, pageForSlug } from '@/lib/routes';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return englishParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMetadata(pageForSlug('', (await params).slug));
}

export default async function EnglishPage({ params }: Props) {
  return <PageView page={pageForSlug('', (await params).slug)} />;
}
