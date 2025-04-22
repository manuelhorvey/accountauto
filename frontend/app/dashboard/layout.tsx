'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '../context/theme';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from '../../components/Dashboard/Dashboard.module.css';
import { getCurrentUser } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setLoading(false);
      } catch (err) {
        console.warn('User not authenticated, redirecting...', err);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  return (
    <ThemeProvider>
      <Navbar />
      <div className={styles.dashboardWrapper}>
        <Sidebar />
        <main className={styles.dashboardContent}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
