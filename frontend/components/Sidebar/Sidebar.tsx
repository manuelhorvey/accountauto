'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser, SessionUser } from "@/lib/api";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Dashboard</h2>

      {user && (
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user.username}</p>
          <small className={styles.userRole}>{user.role}</small>
        </div>
      )}

      {!loading && (
        <nav className={styles.nav} aria-label="Sidebar Navigation">
          <ul>
            <li className={pathname === "/dashboard" ? styles.active : ""}>
              <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined}>Home</Link>
            </li>
            <li className={pathname === "/dashboard/clients" ? styles.active : ""}>
              <Link href="/dashboard/clients" aria-current={pathname === "/dashboard/clients" ? "page" : undefined}>Clients</Link>
            </li>
            <li className={pathname === "/dashboard/employees" ? styles.active : ""}>
              <Link href="/dashboard/employees" aria-current={pathname === "/dashboard/employees" ? "page" : undefined}>Employees</Link>
            </li>
            {user?.role !== "manager" && (
              <li className={pathname === "/dashboard/reports" ? styles.active : ""}>
                <Link href="/dashboard/reports" aria-current={pathname === "/dashboard/reports" ? "page" : undefined}>Reports</Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </aside>
  );
}
