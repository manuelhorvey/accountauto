'use client';

import { useEffect, useState } from 'react';
import styles from '../components/ClientCard.module.css';
import { Client, getCurrentUser } from '../../../lib/api';
import { useRouter } from 'next/navigation';

type ClientCardProps = {
  client: Client;
};

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const user = await getCurrentUser();
        setUserRole(user.role);
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };
    fetchRole();
  }, []);

  const handleEditClientClick = () => {
    router.push(`/dashboard/clients/${client._id}`);
  };

  const handleClientStatementClick = () => {
    router.push(`/dashboard/clients/${client._id}/statements`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>{client.name}</h2>
        <p className={styles.commissions}>
          {client.gross_commission.toFixed(2)} | {client.wins_commission.toFixed(2)}
        </p>
      </div>

      <p><strong>Phone:</strong> {client.phone}</p>
      <p><strong>Location:</strong> {client.location}</p>
      <p className={client.is_active ? styles.active : styles.inactive}>
        {client.is_active ? "Active" : "Inactive"}
      </p>

      <div className={styles.cardActions}>
        <button
          className={styles.editButton}
          onClick={handleEditClientClick}
          disabled={userRole === 'manager'}
          title={userRole === 'manager' ? "Managers cannot edit clients" : "Edit client"}
        >
          Edit
        </button>
        <button
          className={styles.statementButton}
          onClick={handleClientStatementClick}
        >
          Statements
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
