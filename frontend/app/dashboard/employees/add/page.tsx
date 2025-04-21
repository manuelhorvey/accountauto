'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/lib/api';
import styles from './EmployeeAdd.module.css';

const EmployeeAdd = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    position: '',
    status: 'active',
    salary: '',
    hire_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isNaN(Number(form.salary)) || Number(form.salary) <= 0) {
      setError('Please provide a valid salary');
      setLoading(false);
      return;
    }

    if (!form.hire_date) {
      setError('Please provide a hire date');
      setLoading(false);
      return;
    }

    try {
      await createEmployee({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email,
        status: form.status,
        salary: Number(form.salary),
        hire_date: new Date(form.hire_date),
      });

      setSuccess('Employee created successfully!');
      router.push('/dashboard/employees');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Employee creation failed:', err);
        setError(err.message || 'Something went wrong');
      } else {
        console.error('Unknown error:', err);
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Add New Employee</h1>

      {success && <p className={styles.success}>{success}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <label>First Name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.row}>
          <label>Last Name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.row}>
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.row}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className={styles.row}>
          <label>Position</label>
          <input
            name="position"
            value={form.position}
            onChange={handleChange}
          />
        </div>

        <div className={styles.row}>
          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on leave">On Leave</option>
          </select>
        </div>

        <div className={styles.row}>
          <label>Salary (₵)</label>
          <input
            name="salary"
            type="number"
            step="0.01"
            value={form.salary}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.row}>
          <label>Hire Date</label>
          <input
            name="hire_date"
            type="date"
            value={form.hire_date}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Employee'}
        </button>
      </form>
    </div>
  );
};

export default EmployeeAdd;
