'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchStatements, Statement } from '@/lib/api';
import styles from './Statement.module.css';
import { useRouter } from 'next/navigation';

const StatementsPage: React.FC = () => {
  const { id: clientId } = useParams() as { id: string };
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!clientId) return;
    const load = async () => {
      try {
        const data = await fetchStatements(clientId);
        setStatements(data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load statements.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  if (loading) return <div className="text-center p-4">Loading statements...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  const handleNewClientClick = () => {
    router.push(`/dashboard/clients/${clientId}/statements/add`);
  };

  // Modify the edit button to redirect to the specific statement's edit page
  const handleClientEditClick = (statementId: string) => {
    router.push(`/dashboard/clients/${clientId}/statements/${statementId}`);
  };

  const handleClientViewClick = (statementId: string) => {
    router.push(`/statementsview/${statementId}`);
  };




  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h1 className={styles.pageTitle}>Client Statements</h1>
        <button className={styles.newButton} onClick={handleNewClientClick}>New</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>StartDate</th>
              <th>DueDate</th>
              <th>Gross</th>
              <th>Wins</th>
              <th>Net</th>
              <th>Wins Ttl</th>
              <th>Balance Off.</th>
              <th>Balance Cl.</th>
              <th>Prev Off.</th>
              <th>Prev Cl.</th>
              <th>Cash Rec.</th>
              <th>Cash Paid</th>
              <th>Expense</th>
              <th>Final Rec.</th>
              <th>Final Pay.</th>
            </tr>
          </thead>
          <tbody>
            {statements.map((s) => (
              <tr key={s._id}>
                <td>{new Date(s.start_date).toLocaleDateString()}</td>
                <td>{new Date(s.due_date).toLocaleDateString()}</td>
                <td>{s.gross.toLocaleString()}</td>
                <td>{s.wins.toLocaleString()}</td>
                <td>{s.net.toLocaleString()}</td>
                <td>{s.wins_commission_total.toLocaleString()}</td>
                <td>{s.balance_office.toLocaleString()}</td>
                <td>{s.balance_client.toLocaleString()}</td>
                <td>{s.prev_balance_office.toLocaleString()}</td>
                <td>{s.prev_balance_client.toLocaleString()}</td>
                <td>{s.cash_received.toLocaleString()}</td>
                <td>{s.cash_paid.toLocaleString()}</td>
                <td>{(s as any).expenses?.toLocaleString() ?? '-'}</td>
                <td>{s.final_receivable.toLocaleString()}</td>
                <td>{s.final_payable.toLocaleString()}</td>
                <td className='buttons'>
                  <div className="button-container">
                    <button
                      className="editbutton"
                      onClick={() => handleClientEditClick(s._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="viewbutton"
                      onClick={() => handleClientViewClick(s._id)}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatementsPage;
