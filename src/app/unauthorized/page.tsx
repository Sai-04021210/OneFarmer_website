'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
      <p className="text-lg text-gray-600 mb-8">
        You do not have permission to access this page.
      </p>
      <Link href="/">
        <a className="text-blue-500 hover:underline">Go back to the homepage</a>
      </Link>
    </div>
  );
}
