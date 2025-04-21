'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  fetchClients,
  fetchEmployees,
  fetchStatements,
  Client,
  Employee,
  Statement,
} from "@/lib/api";
import styles from "../../components/Dashboard/Dashboard.module.css";

const getCurrentWeekRange = (): [Date, Date] => {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return [weekStart, weekEnd];
};

const Dashboard: React.FC = () => {
  const router = useRouter();

  const [clientStats, setClientStats] = useState({ active: 0, inactive: 0 });
  const [employeeStats, setEmployeeStats] = useState({ active: 0, inactive: 0, onLeave: 0 });
  const [weeklyActiveStatements, setWeeklyActiveStatements] = useState<Statement[]>([]);
  const [totalNet, setTotalNet] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCurrentUser();

        const [clientsData, employeesData, statementsData] = await Promise.all([
          fetchClients(),
          fetchEmployees(),
          fetchStatements(),
        ]);

        const activeClients = clientsData.filter((c: Client) => c.is_active);
        const inactiveClients = clientsData.length - activeClients.length;

        const activeEmployees = employeesData.filter((e: Employee) => e.status === 'active').length;
        const inactiveEmployees = employeesData.filter((e: Employee) => e.status === 'inactive').length;
        const onLeaveEmployees = employeesData.filter((e: Employee) => e.status === 'on leave').length;

        const [weekStart, weekEnd] = getCurrentWeekRange();

        const activeClientIds = activeClients.map((client) => client._id);
        const weeklyStatements = statementsData.filter((s) => {
          const date = new Date(s.start_date);
          const clientId = typeof s.client === 'string' ? s.client : s.client._id;
          return date >= weekStart && date <= weekEnd && activeClientIds.includes(clientId);
        });

        const netSum = weeklyStatements.reduce((acc, s) => acc + (s.net ?? 0), 0);
        const cashSum = weeklyStatements.reduce((acc, s) => acc + (s.cash_received ?? 0), 0);
        const balanceDiff = weeklyStatements.reduce((acc, s) => {
          const receivable = s.final_receivable ?? 0;
          const payable = s.final_payable ?? 0;
          return acc + (receivable - payable);
        }, 0);

        setClientStats({ active: activeClients.length, inactive: inactiveClients });
        setEmployeeStats({ active: activeEmployees, inactive: inactiveEmployees, onLeave: onLeaveEmployees });
        setWeeklyActiveStatements(weeklyStatements);
        setTotalNet(netSum);
        setTotalCash(cashSum);
        setFinalBalance(balanceDiff);
      } catch (err) {
        console.warn("Auth or data-fetch failed:", err);
        setError("An error occurred. Please try again.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toFixed(2);
  };

  if (loading) return <p>Loading dashboard…</p>;

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardHeading}>Dashboard Overview</h1>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h2>{clientStats.active + clientStats.inactive}</h2>
          <p>Clients</p>
          <small>Active: {clientStats.active} | Inactive: {clientStats.inactive}</small>
        </div>
        <div className={styles.card}>
          <h2>{employeeStats.active + employeeStats.inactive + employeeStats.onLeave}</h2>
          <p>Employees</p>
          <small>
            Active: {employeeStats.active} | Inactive: {employeeStats.inactive} | On Leave: {employeeStats.onLeave}
          </small>
        </div>
        <div className={styles.card}>
          <h2>{formatNumber(totalNet)}</h2>
          <p>Total Net (Current Week)</p>
        </div>
        <div className={styles.card}>
          <h2>{formatNumber(totalCash)}</h2>
          <p>Total Cash Received (Current Week)</p>
        </div>
        <div className={styles.card}>
          <h2 style={{ color: finalBalance < 0 ? 'red' : 'green' }}>
            {finalBalance < 0 ? `-${formatNumber(Math.abs(finalBalance))}` : formatNumber(finalBalance)}
          </h2>
          <p>Final Balance (Receivable - Payable)</p>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Recent Statements (Active Clients Only)</h2>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.statementTable}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Gross</th>
                <th>Net</th>
                <th>Wins Commission</th>
                <th>Final Receivable</th>
                <th>Final Payable</th>
              </tr>
            </thead>
            <tbody>
              {weeklyActiveStatements.map((s) => (
                <tr key={s._id}>
                  <td>{typeof s.client === "string" ? s.client : s.client.name}</td>
                  <td>{new Date(s.start_date).toLocaleDateString()}</td>
                  <td>{new Date(s.due_date).toLocaleDateString()}</td>
                  <td>{formatNumber(s.gross)}</td>
                  <td>{formatNumber(s.net)}</td>
                  <td>{formatNumber(s.wins_commission_total)}</td>
                  <td>{formatNumber(s.final_receivable)}</td>
                  <td>{formatNumber(s.final_payable)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
