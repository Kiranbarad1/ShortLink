'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [editShortCode, setEditShortCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/admin/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link) => {
    setEditingId(link._id);
    setEditUrl(link.originalUrl);
    setEditShortCode(link.shortCode);
  };

  const saveEdit = async () => {
    try {
      const response = await fetch('/api/admin/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, originalUrl: editUrl, shortCode: editShortCode }),
      });

      if (response.ok) {
        toast.success('Link updated');
        setEditingId(null);
        fetchLinks();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Update failed');
      }
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const deleteLink = async (id) => {
    if (!confirm('Delete this link?')) return;

    try {
      const response = await fetch('/api/admin/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success('Link deleted');
        fetchLinks();
      } else {
        toast.error('Delete failed');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Links</h1>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Short Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Original URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {links.map((link) => (
                  <tr key={link._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === link._id ? (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">/s/</span>
                          <input
                            value={editShortCode}
                            onChange={(e) => setEditShortCode(e.target.value)}
                            className="ml-1 px-2 py-1 border rounded text-sm w-24"
                          />
                        </div>
                      ) : (
                        <code className="text-sm text-indigo-600 dark:text-indigo-400">/s/{link.shortCode}</code>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {editingId === link._id ? (
                        <input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900 dark:text-white break-all">{link.originalUrl}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {link.userId ? (
                        <span className="text-blue-600">{link.userName}</span>
                      ) : (
                        <span className="text-gray-600">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{link.clicks}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {link.expiresAt && new Date() > new Date(link.expiresAt) ? (
                        <span className="text-red-600">Expired</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {editingId === link._id ? (
                        <>
                          <button onClick={saveEdit} className="text-green-600 hover:text-green-900">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(link)} className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button onClick={() => deleteLink(link._id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}