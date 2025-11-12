'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function withAdminAuth(Component: React.ComponentType<any>) {
  return function WithAdminAuth(props: any) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/unauthorized');
      return null;
    }

    return <Component {...props} />;
  };
}
