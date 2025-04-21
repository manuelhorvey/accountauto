'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchEmployees, updateEmployee, CreateEmployeeData, Employee } from '@/lib/api';
import styles from '../add/EmployeeAdd.module.css';

const EmployeeEdit = () => {
  const router = useRouter();
  const { id } = useParams(); // get the employee id from URL
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<CreateEmployeeData>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    status: 'active',
    hire_date: new Date(),
    salary: 0,
  });

  useEffect(() => {
    const loadEmployee = async () => {
      const allEmployees = await fetchEmployees();
      const found = allEmployees.find((emp) => emp._id === id);
      if (found) {
        setEmployee(found);
        setForm({ ...found, hire_date: new Date(found.hire_date) });
      }
    };

    if (id) loadEmployee();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateEmployee(id as string, form);
      router.push('/dashboard/employees');
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Employee Update failed:", err);
        setError(err.message || 'Update failed');
      } else {
        console.error("Employee Update failed with unknown error:", err);
        setError("Invalid details");
      }
    } finally {
      setLoading(false);
    }    
  };

  if (!employee) return <p>Loading employee data...</p>;

  return (
    <div className={styles.container}>
      <h1>Edit Employee</h1>

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
            type="number"
            step="0.01"
            value={form.salary}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Employee'}
        </button>
      </form>
    </div>
  );
};

export default EmployeeEdit;
