// app/dashboard/client/add/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ClientAdd.module.css';
import { createClient, CreateClientData } from '@/lib/api';

const ClientAdd: React.FC = () => {
  const [name, setName] = useState('');
  const [grossCommission, setGrossCommission] = useState(0);
  const [winsCommission, setWinsCommission] = useState(0);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data: CreateClientData = {
      name,
      phone,
      location,
      gross_commission: grossCommission,
      wins_commission: winsCommission,
    };

    try {
      await createClient(data);
      router.push('/dashboard/clients');
    } catch (err: any) {
      setError(err.message || 'Error adding client. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Client</h1>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Client Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="gross_commission">Gross Commission (%)</label>
          <input
            id="gross_commission"
            type="number"
            value={grossCommission}
            onChange={e => setGrossCommission(+e.target.value)}
            placeholder="Enter gross commission"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="wins_commission">Wins Commission (%)</label>
          <input
            id="wins_commission"
            type="number"
            value={winsCommission}
            onChange={e => setWinsCommission(+e.target.value)}
            placeholder="Enter wins commission"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Enter client location"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="is_active">
            <input
              id="is_active"
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />{' '}
            Active
          </label>
        </div>

        <button type="submit" className={styles.submitButton}>
          Add Client
        </button>
      </form>
    </div>
  );
};

export default ClientAdd;
