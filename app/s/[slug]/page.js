'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function RedirectPage() {
  const params = useParams();
  const slug = params.slug;

  useEffect(() => {
    if (slug) {
      // Direct redirect to API route which handles the redirect
      window.location.href = `/api/redirect/${slug}`;
    }
  }, [slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}