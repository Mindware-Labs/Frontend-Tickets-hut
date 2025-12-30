'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (auth.isAuthenticated()) {
      // Get user role from localStorage
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          const role = user?.role?.toLowerCase();
          const redirectPath = role === 'agent' ? '/agent-dashboard' : '/dashboard';
          router.push(redirectPath);
        } else {
          router.push('/dashboard');
        }
      } catch {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-slate-400">Loading...</div>
    </div>
  );
}
