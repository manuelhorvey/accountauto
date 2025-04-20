'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchStatementWithSales, updateStatement, StatementWithSales, CreateStatementData, DailySalesInput } from '@/lib/api';
import styles from './StatementEdit.module.css';

const StatementEdit: React.FC = () => {
  const router = useRouter();
  const { id: clientId, sid: statementId } = useParams<{ id: string, sid: string }>();

  const [formData, setFormData] = useState<StatementWithSales | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!clientId || !statementId) {
      console.error('Client ID or Statement ID is missing');
      return;
    }

    const fetchData = async () => {
      try {
        const data = await fetchStatementWithSales(clientId, statementId);

        // Ensure start_date and due_date are in the correct format (YYYY-MM-DD)
        const formattedData = {
          ...data,
          start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
          due_date: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : '',
          dailySales: data.dailySales || { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }, // Ensure daily sales are initialized with numbers
        };

        setFormData(formattedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch statement data:', err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId, statementId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name in formData!.dailySales) {
      const newValue = value === '' ? 0 : parseFloat(value); // Treat empty input as 0 and ensure it's a number
      if (isNaN(newValue)) {  // Add a validation check for valid number
        console.error(`Invalid value for ${name}: ${value}`);
        return;
      }
      setFormData((prev) => ({
        ...prev!,
        dailySales: {
          ...prev!.dailySales,
          [name as keyof DailySalesInput]: newValue,
        },
      }));
    } else {
      const newValue = name === 'wins' || name === 'cash_received' || name === 'cash_paid' || name === 'expenses'
        ? value === '' ? 0 : parseFloat(value) // Treat empty input as 0 for these fields too
        : value;
      setFormData((prev) => ({
        ...prev!,
        [name]: newValue,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    const updateData: CreateStatementData = {
      client: typeof formData.client === 'string' ? formData.client : formData.client._id,
      wins: formData.wins,
      cash_received: formData.cash_received,
      cash_paid: formData.cash_paid,
      expenses: formData.expenses,
      dailySales: formData.dailySales,
      start_date: formData.start_date,
      due_date: formData.due_date,
    };

    try {
      await updateStatement(statementId, updateData);
      router.push(`/dashboard/clients/${typeof formData.client === 'string' ? formData.client : formData.client._id}/statements`);
    } catch (err) {
      console.error('Failed to update statement:', err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Days of the week for daily sales
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className={styles.container}>
      <h2>Edit Statement</h2>
      {formData && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div>
              <label htmlFor="start_date" className={styles.label}>Start Date</label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date || ''}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="due_date" className={styles.label}>Due Date</label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date || ''}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.row}>
            <div>
              <label htmlFor="wins" className={styles.label}>Wins</label>
              <input
                id="wins"
                name="wins"
                type="number"
                value={formData.wins}
                placeholder="Wins"
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="cash_received" className={styles.label}>Cash Received</label>
              <input
                id="cash_received"
                name="cash_received"
                type="number"
                value={formData.cash_received}
                placeholder="Cash Received"
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="cash_paid" className={styles.label}>Cash Paid</label>
              <input
                id="cash_paid"
                name="cash_paid"
                type="number"
                value={formData.cash_paid}
                placeholder="Cash Paid"
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="expenses" className={styles.label}>Expenses</label>
              <input
                id="expenses"
                name="expenses"
                type="number"
                value={formData.expenses || 0}
                placeholder="Expenses"
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <h3>Daily Sales</h3>
          <div className={styles.dailySalesGrid}>
            {daysOfWeek.map((day) => (
              <div key={day} className={styles.dailySalesItem}>
                <label htmlFor={day} className={styles.label}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                <input
                  id={day}
                  name={day}
                  type="number"
                  value={formData.dailySales[day as keyof DailySalesInput]}
                  placeholder={day.charAt(0).toUpperCase() + day.slice(1)}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            ))}
          </div>
          <button type="submit" className={styles.button}>Update</button>
        </form>
      )}
    </div>
  );
};

export default StatementEdit;
