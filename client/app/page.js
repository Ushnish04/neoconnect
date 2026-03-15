'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
    else if (user.role === 'staff') router.push('/dashboard/staff');
    else if (user.role === 'secretariat') router.push('/dashboard/secretariat');
    else if (user.role === 'case_manager') router.push('/dashboard/case-manager');
    else if (user.role === 'admin') router.push('/dashboard/admin');
  }, [user, loading, router]);

  return null;
}