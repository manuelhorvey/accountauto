'use client'
import React, { useState, useEffect } from 'react';
import ReportTable from '@/features/report/components/ReportTable';
import { Report } from '@/lib/api'; 
import { fetchAllReports } from '@/lib/api';  
import { useRouter } from 'next/navigation';

const Reports: React.FC = () => {
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
        setReports(fetchedReports); // Set the fetched reports
      } catch (err) {
        setError('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleNewClick = () => {
    router.push('/dashboard/reports/add'); 
  };
  return (
    <div>
      <div className="header">
        <button className="new-button" onClick={handleNewClick}>New</button>
      </div>
      {reports.length > 0 ? (
        <ReportTable reports={reports} />
      ) : (
        <div>No reports available</div>
      )}
    </div>
  );
};

export default Reports;
