'use client';

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchClient, updateClient, CreateClientData, Client } from '@/lib/api';
import styles from '../add/ClientAdd.module.css';

export default function ClientEdit() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<CreateClientData & { is_active: boolean }>({
    name: '',
    gross_commission: 0,
    wins_commission: 0,
    phone: '',
    location: '',
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchClient(id)
      .then((c) => {
        if (isMounted) {
          setClient(c);
          setForm({
            name: c.name,
            phone: c.phone,
            location: c.location,
            gross_commission: c.gross_commission,
            wins_commission: c.wins_commission,
            is_active: c.is_active,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Failed to load client.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name.endsWith('_commission') || name === 'phone'
            ? type === 'number'
              ? +value
              : value
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateClient(id, form);
      router.push('/dashboard/clients');
    }
    catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Failed to update client.');
      }
    }
  };

  if (!client) return <div className="text-center">Loading…</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Client</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Client Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="gross_commission">Gross Commission (%)</label>
          <input
            id="gross_commission"
            name="gross_commission"
            type="number"
            value={form.gross_commission}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="wins_commission">Wins Commission (%)</label>
          <input
            id="wins_commission"
            name="wins_commission"
            type="number"
            value={form.wins_commission}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="is_active">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
              className={styles.checkbox}
            />{' '}
            Active
          </label>
        </div>


        <button type="submit" className={styles.submitButton}>
          Save Changes
        </button>
      </form>
    </div>
  );
}
