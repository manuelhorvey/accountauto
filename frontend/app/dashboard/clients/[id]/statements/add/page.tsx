'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createStatement, CreateStatementData } from '@/lib/api';
import styles from './StatementAdd.module.css';

const StatementAdd: React.FC = () => {
  const router = useRouter();
  const { id: clientId } = useParams() as { id: string };

  const [formData, setFormData] = useState<CreateStatementData>({
    client: clientId,
    wins: 0,
    cash_received: 0,
    cash_paid: 0,
    expenses: 0,
    start_date: '',
    due_date: '',
    dailySales: {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name in formData.dailySales) {
      setFormData((prev) => ({
        ...prev,
        dailySales: {
          ...prev.dailySales,
          [name]: parseFloat(value),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'wins' || name === 'cash_received' || name === 'cash_paid' || name === 'expense'
          ? parseFloat(value)
          : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the formData before submitting
    const validDailySales = Object.values(formData.dailySales).every(day => !isNaN(day));
    if (!validDailySales) {
      console.error('Daily sales should be valid numbers');
      return;
    }

    try {
      await createStatement(formData);
      router.push(`/dashboard/clients/${clientId}/statements`);
    } catch (err) {
      console.error('Failed to create statement:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Add Statement</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <input name="start_date" type="date" onChange={handleChange} className={styles.input} />
          <input name="due_date" type="date" onChange={handleChange} className={styles.input} />
        </div>
        <div className={styles.row}>
          <input name="wins" type="number" placeholder="Wins" onChange={handleChange} className={styles.input} />
          <input name="cash_received" type="number" placeholder="Cash Received" onChange={handleChange} className={styles.input} />
          <input name="cash_paid" type="number" placeholder="Cash Paid" onChange={handleChange} className={styles.input} />
          <input name="expenses" type="number" placeholder="Expense" onChange={handleChange} className={styles.input} />
        </div>

        <h3>Daily Sales</h3>
        <div className={styles.dailySalesGrid}>
          {Object.keys(formData.dailySales).map((day) => (
            <input
              key={day}
              name={day}
              type="number"
              placeholder={day.charAt(0).toUpperCase() + day.slice(1)}
              onChange={handleChange}
              className={styles.input}
            />
          ))}
        </div>

        <button type="submit" className={styles.button}>Submit</button>
      </form>
    </div>
  );
};

export default StatementAdd;