'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StatementWithSales, getStatementDetails } from '@/lib/api';
import styles from './StatementDetail.module.css';

const StatementDetail: React.FC = () => {
  const { id: statementId } = useParams<{ id: string }>();
  const [statement, setStatement] = useState<StatementWithSales | null>(null);
  const [loading, setLoading] = useState(true); // Update loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!statementId) return;

    (async () => {
      try {
        setLoading(true); // Start loading
        const data = await getStatementDetails(statementId);
        setStatement(data);
        setLoading(false); // Stop loading
      } catch (err: unknown) {
        setLoading(false); // Stop loading on error
        if (err instanceof Error) {
          console.error('Error fetching statement:', err);
          setError(err.message || 'Failed to load statement');
        } else {
          console.error('Unknown error:', err);
          setError('An unknown error occurred');
        }
      }      
    })();
  }, [statementId]);

  if (loading) return <div className={styles.status}>Loading statement…</div>;
  if (error) return <div className={`${styles.status} ${styles.error}`}>{error}</div>;
  if (!statement) return <div className={styles.status}>No statement found.</div>;

  const clientName =
    typeof statement.client === 'string'
      ? statement.client
      : statement.client?.name || 'Unknown';

  return (
    <div className={styles.a4Container}>
      <header className={styles.header}>
        <div className={styles.companyInfo}>
          <h1>DAN SAVIOUR ENTERPRISE</h1>
          <p>P.O BOX 4822, CO TEMA C1</p>
          <p>KUMASI RD, OPP ROYALTY CHURCH, AFIENYA</p>
        </div>
        <div className={styles.statementStatus}>
          APPROVED STATEMENT OF ACCOUNT
        </div>
      </header>

      <section className={styles.clientInfo}>
        <p><strong>Client:</strong> {clientName}</p>
        <p><strong>Start Date:</strong> {new Date(statement.start_date).toLocaleDateString()}</p>
        <p><strong>Due Date:</strong> {new Date(statement.due_date).toLocaleDateString()}</p>
      </section>

      <section className={styles.dailySales}>
        <h3>Daily Sales</h3>
        <div className={styles.salesGrid}>
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
            <div key={day} className={styles.dailySalesItem}>
              <span className={styles.dayLabel}>
                {day.charAt(0).toUpperCase() + day.slice(1)}:
              </span>
              <span className={styles.dayValue}>
                {statement.dailySales[day as keyof typeof statement.dailySales]?.toLocaleString() ?? '0'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.financials}>

        <p><strong>Gross:</strong> {statement.gross?.toLocaleString() ?? '0'}</p>
        <p><strong>Wins:</strong> {statement.wins?.toLocaleString() ?? '0'}</p>
        <p><strong>Wins Total:</strong> {statement.wins_commission_total?.toLocaleString() ?? '0'}</p>
        <p><strong>Net:</strong> {statement.net?.toLocaleString() ?? '0'}</p>
        <div className={styles.offcCli}>
          <div className={styles.Offc}>
            <p><strong>Balance (Office):</strong> {statement.balance_office?.toLocaleString() ?? '0'}</p>
            <p><strong>Previous Balance (Office):</strong> {statement.prev_balance_office?.toLocaleString() ?? '0'}</p>
            <p><strong>Cash Received:</strong> {statement.cash_received?.toLocaleString() ?? '0'}</p>
            <p><strong>Final Receivable:</strong> {statement.final_receivable?.toLocaleString() ?? '0'}</p>
          </div>
          <div className={styles.Cli}>
            <p><strong>Expenses:</strong> {statement.expenses?.toLocaleString() ?? '0'}</p>
            <p><strong>Balance (Client):</strong> {statement.balance_client?.toLocaleString() ?? '0'}</p>
            <p><strong>Previous Balance (Client):</strong> {statement.prev_balance_client?.toLocaleString() ?? '0'}</p>
            <p><strong>Cash Paid:</strong> {statement.cash_paid?.toLocaleString() ?? '0'}</p>
            <p><strong>Final Payable:</strong> {statement.final_payable?.toLocaleString() ?? '0'}</p>
          </div>
        </div>

      </section>

      <button onClick={() => window.print()} style={{ marginBottom: '1rem' }}>
        Print Statement
      </button>

      <footer className={styles.footer}>
        Generated on {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
};

export default StatementDetail;
