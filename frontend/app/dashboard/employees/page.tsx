'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Employee, fetchEmployees } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from '../../../features/employee/components/EmployeeCard.module.css';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      const data = await fetchEmployees();
      if (data) setEmployees(data);
    };

    loadEmployees();
  }, []);

  const handleNewEmployeeClick = () => {
    router.push('/dashboard/employees/add');
  };

  const handleEditClick = (id: string) => {
    router.push(`/dashboard/employees/${id}`);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
  
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
  
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Employee Table</title>
            <style>
              body {
                font-family: sans-serif;
                padding: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px 12px;
                border: 1px solid #ccc;
                text-align: left;
              }
              th {
                background-color: #f3f4f6;
              }
              tr:nth-child(even) {
                background-color: #f9fafb;
              }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };
  

  return (
    <div className={styles.container}>
      <div className={`${styles.header} no-print`}>
        <h1>Employees</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleNewEmployeeClick}>New</button>
          <button onClick={handlePrint}>Print</button>
        </div>
      </div>

      <div className={styles.tableContainer} ref={printRef}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Hire Date</th>
              <th>Salary</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>{emp.status}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.email || '-'}</td>
                  <td>{new Date(emp.hire_date).toLocaleDateString()}</td>
                  <td>₵{emp.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="no-print">
                    <button onClick={() => handleEditClick(emp._id)}>Edit</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
