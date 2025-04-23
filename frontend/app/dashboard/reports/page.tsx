'use client'
import React, { useState, useEffect } from 'react';
import ReportTable from '@/features/report/components/ReportTable';
import { Report } from '@/lib/api';
import { fetchAllReports } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from '@/features/report/components/ReportTable.module.css';

const Reports = () => {
  // Local state for reports, loading, and error
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // UseEffect to fetch report data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all reports using fetchAllReports
        const fetchedReports = await fetchAllReports();
        setReports(fetchedReports);
      } catch (err: unknown) {
        if (err instanceof Error) {
          // If it's an instance of Error, access the message
          console.error('Failed to fetch reports:', err);
          setError(err.message || 'Failed to fetch reports');
        } else {
          // If it's not an Error, fall back to a generic message
          console.error('Failed to fetch reports with unknown error:', err);
          setError('Failed to fetch reports');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewClick = () => {
    router.push('/dashboard/reports/add');
  };

  const handleView = (reportId: string) => {
    router.push(`/reportsview/${reportId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Reports</h1>
        <button className={styles.newbutton} onClick={handleNewClick}>New</button>
      </div>

      {loading && <div>Loading reports...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && reports.length > 0 ? (
        <ReportTable reports={reports} onView={handleView} />
      ) : (
        !loading && !error && <div>No reports available</div>
      )}
    </div>
  );
}

export default Reports;
