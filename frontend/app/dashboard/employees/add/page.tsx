'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '@/lib/api'; // Import the createEmployee function
import styles from './EmployeeAdd.module.css'; // Optional, if you want custom styles

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
    hire_date: '', // Add the hire_date to the form state
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // For displaying a success message

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate salary input
    if (isNaN(Number(form.salary)) || Number(form.salary) <= 0) {
      setError('Please provide a valid salary');
      setLoading(false);
      return;
    }

    // Validate hire_date input
    if (!form.hire_date) {
      setError('Please provide a hire date');
      setLoading(false);
      return;
    }

    try {
      // Use the createEmployee function from your lib/api file
      const employee = await createEmployee({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email,
        status: form.status,
        salary: Number(form.salary),
        hire_date: new Date(form.hire_date), // Ensure the date is correctly formatted
      });
      
      setSuccess('Employee created successfully!');
      router.push('/dashboard/employees'); // Redirect to the employees dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
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
          <input name="first_name" value={form.first_name} onChange={handleChange} required />
        </div>

        <div className={styles.row}>
          <label>Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>

        <div className={styles.row}>
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </div>

        <div className={styles.row}>
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} type="email" />
        </div>

        <div className={styles.row}>
          <label>Position</label>
          <input name="position" value={form.position} onChange={handleChange} />
        </div>

        <div className={styles.row}>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on leave">On Leave</option>
          </select>
        </div>

        <div className={styles.row}>
          <label>Salary (₵)</label>
          <input
            name="salary"
            value={form.salary}
            onChange={handleChange}
            type="number"
            step="0.01"
            required
          />
        </div>

        {/* Add a Date Picker for Hire Date */}
        <div className={styles.row}>
          <label>Hire Date</label>
          <input
            name="hire_date"
            value={form.hire_date}
            onChange={handleChange}
            type="date"
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
