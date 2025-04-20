'use client';

import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import styles from '../../components/Dashboard/Dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className={styles.dashboardWrapper}>
        <Sidebar />
        <main className={styles.dashboardContent}>
          {children}
        </main>
      </div>
    </>
  );
}
