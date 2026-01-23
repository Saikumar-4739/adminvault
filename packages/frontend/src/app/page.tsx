'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

import { PageLoader } from '@/components/ui/Spinner';

const HomePage: React.FC = () => {
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
      <PageLoader message="Initializing application..." />
    </div>
  );
};

export default HomePage;