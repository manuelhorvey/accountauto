import React from 'react';
import { Report } from '@/lib/api';
import styles from './ReportTable.module.css'; // Import the CSS module

interface ReportTableProps {
  reports: Report[];
}

const ReportTable: React.FC<ReportTableProps> = ({ reports }) => {
  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.tableHeader}>Report Overview</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Period Type</th>
            <th>Period</th>
            <th>Total Gross</th>
            <th>Total Wins</th>
            <th>Total Net</th>
            <th>Total Wins Commission</th>
            <th>Total Balance (Office)</th>
            <th>Total Balance (Client)</th>
            <th>Generated At</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td>{report._id}</td>
              <td>{report.clientName}</td>
              <td>{report.period_type}</td>
              <td>{report.period}</td>
              <td>{report.total_gross}</td>
              <td>{report.total_wins}</td>
              <td>{report.total_net}</td>
              <td>{report.total_wins_commission}</td>
              <td>{report.total_balance_office}</td>
              <td>{report.total_balance_client}</td>
              <td>{report.generated_at}</td>
              <td>{report.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
