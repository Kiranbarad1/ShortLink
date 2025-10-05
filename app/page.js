'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ShortenForm from '../components/shortlink/ShortenForm';
import LinkResult from '../components/shortlink/LinkResult';

export default function HomePage() {
  const { data: session } = useSession();
  const [createdLink, setCreatedLink] = useState(null);
  const [anonymousLinks, setAnonymousLinks] = useState([]);

  useEffect(() => {
    // Fetch recent anonymous links from database if not logged in
    if (!session) {
      fetchAnonymousLinks();
    }
  }, [session]);

  const fetchAnonymousLinks = async () => {
    try {
      const response = await fetch('/api/anonymous-links');
      if (response.ok) {
        const links = await response.json();
        setAnonymousLinks(links);
      }
    } catch (error) {
      console.error('Failed to fetch anonymous links:', error);
    }
  };

  const handleLinkCreated = (link) => {
    setCreatedLink(link);
    // Add to anonymous links list if not logged in
    if (!session) {
      setAnonymousLinks(prev => [link, ...prev]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Shorten Your URLs
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Create short, memorable links with click tracking.
        </p>
      </div>

      {/* Main Form */}
      <ShortenForm onLinkCreated={handleLinkCreated} />

      {/* Result Display */}
      {createdLink && (
        <LinkResult link={createdLink} />
      )}

      {/* Anonymous Links List */}
      {!session && anonymousLinks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Recent Links</h3>
          <div className="space-y-3">
            {anonymousLinks.slice(-5).reverse().map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <a 
                    href={`/s/${link.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {window.location.origin}/s/{link.shortCode}
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{link.originalUrl}</p>
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  {(() => {
                    const createdTime = new Date(link.createdAt);
                    const expiryTime = new Date(createdTime.getTime() + 24 * 60 * 60 * 1000);
                    return `Expires: ${expiryTime.toLocaleDateString()} at ${expiryTime.toLocaleTimeString()}`;
                  })()}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            ⚠️ Anonymous links expire after 24 hours. <a href="/auth/login" className="text-blue-600 hover:underline">Sign in</a> to keep them longer!
          </p>
        </div>
      )}


    </div>
  );
}