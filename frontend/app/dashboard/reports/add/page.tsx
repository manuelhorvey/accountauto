'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReport, CreateReportData, fetchClients, Client } from '@/lib/api';
import styles from './ReportsAdd.module.css';

const ReportsAdd = () => {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<CreateReportData>({
    client: '',
    period_type: 'monthly',
    period: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients();
        setClients(data);
      } catch {
        setError('Failed to load clients');
      }
    };

    loadClients();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const report = await createReport(form);
      if (report) {
        router.push('/dashboard/reports');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.msg || 'Failed to create report';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create New Report</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Client</label>
          <select
            name="client"
            value={form.client}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Period Type</label>
          <select
            name="period_type"
            value={form.period_type}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Period (e.g. 2025-04)</label>
          <input
            type="text"
            name="period"
            value={form.period}
            onChange={handleChange}
            className={styles.input}
            placeholder="YYYY-MM"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Notes</label>
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Creating...' : 'Create Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportsAdd;
