import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { RootDocument } from '@/components/RootDocument';

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#00717D' };

export default function AmharicLayout({ children }: { children: ReactNode }) {
  return <RootDocument lang="am">{children}</RootDocument>;
}
