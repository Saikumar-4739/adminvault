'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoleEnum } from '@adminvault/shared-models';

export const HomePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on user role (case-insensitive)
        const role = user.role?.toUpperCase() || '';
        if (role.includes('ADMIN') || role === 'MANAGER') {
          // Admins and managers go to dashboard
          router.push('/dashboard');
        } else {
          // Regular users go directly to create ticket page
          router.push('/create-ticket');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default HomePage;
