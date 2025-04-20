'use client';

import { useState, useEffect } from "react";
import { Client, fetchClients, getCurrentUser, SessionUser } from "@/lib/api"; 
import ClientCard from "../../../features/client/components/ClientCard";
import styles from "../../../features/client/components/ClientCard.module.css";
import { useRouter } from 'next/navigation';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const [clientData, currentUser] = await Promise.all([
          fetchClients(),
          getCurrentUser(),
        ]);
        setClients(clientData);
        setUser(currentUser);
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []); 

  const handleNewClientClick = () => {
    router.push('/dashboard/clients/add'); 
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className={styles.clientsContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Clients</h1>
        <button
          className={styles.newButton}
          onClick={handleNewClientClick}
          disabled={user?.role === "manager"}
          title={user?.role === "manager" ? "Managers cannot create clients" : ""}
        >
          New
        </button>
      </div>

      <div className={styles.clientList}>
        {clients.map((client) => (
          <ClientCard key={client._id} client={client} />
        ))}
      </div>
    </div>
  );
};

export default ClientsPage;
