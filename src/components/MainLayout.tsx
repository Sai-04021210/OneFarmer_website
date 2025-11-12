'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const standalonePages = ['/login', '/unauthorized'];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = standalonePages.includes(pathname);

  return (
    <>
      {!isStandalone && <Header />}
      {children}
      {!isStandalone && <Footer />}
    </>
  );
}
