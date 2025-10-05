'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function ShortenForm({ onLinkCreated }) {
  const { data: session } = useSession();
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (plan) => {
    try {
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Payment setup failed');
      }
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      toast.error('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (isCustom && !session) {
      toast.error('Please sign in to use custom aliases');
      return;
    }

    if (isCustom && !customAlias.trim()) {
      toast.error('Please enter a custom alias');
      return;
    }

    if (isCustom && !/^[a-zA-Z0-9-_]+$/.test(customAlias)) {
      toast.error('Custom alias can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: url,
          customAlias: isCustom ? customAlias : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link');
      }

      toast.success('Link created successfully!');
      onLinkCreated(data);
      setUrl('');
      setCustomAlias('');
      setIsCustom(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Shorten Your URL
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter your long URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
        </div>

        {session && (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="custom"
              checked={isCustom}
              onChange={(e) => setIsCustom(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              disabled={isLoading}
            />
            <label htmlFor="custom" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom Link
            </label>
          </div>
        )}

        {session && isCustom && (
          <div>
            <label htmlFor="alias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom alias
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm">
                {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/s/
              </span>
              <input
                type="text"
                id="alias"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="my-custom-link"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              isCustom ? 'Custom Link' : 'Shorten Link'
            )}
          </button>
        </div>
      </form>

      {!session ? (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            <a href="/auth/login" className="font-medium hover:underline">
              Sign in
            </a> for custom LINK and 7-day expiry! (Anonymous: 1 day, Premium: 30 days, Premium+: Lifetime)
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              ⏰ Your links will expire in <strong>7 days</strong> (Free Plan)
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-center">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200">Premium Plan</h4>
              <p className="text-sm text-purple-600 dark:text-purple-300">30-day expiry • $5/month</p>
              <button 
                onClick={() => handleUpgrade('premium')}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Upgrade
              </button>
            </div>
            <div className="p-4 bg-gold-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Premium Plus</h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-300">Lifetime links • $15/month</p>
              <button 
                onClick={() => handleUpgrade('premium_plus')}
                className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}