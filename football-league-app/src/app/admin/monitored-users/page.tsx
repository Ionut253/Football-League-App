"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MonitoredUsersPage() {
  const [monitoredUsers, setMonitoredUsers] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const fetchMonitoredUsers = async () => {
      try {
        const response = await fetch('/api/admin/monitored-users', {
          headers: {
            'user-data': user,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch monitored users');
        }
        const data = await response.json();
        setMonitoredUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchMonitoredUsers();
  }, [router]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Monitored Users</h1>
      {monitoredUsers.length === 0 ? (
        <p>No monitored users found.</p>
      ) : (
        <ul className="list-disc pl-5">
          {monitoredUsers.map((user: any) => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
} 