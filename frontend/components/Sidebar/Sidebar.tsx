'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser, SessionUser } from "@/lib/api";
import { useTheme } from '../../app/context/theme';  
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { isDark, toggleTheme } = useTheme();  // Use the theme context
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
              <Link href="/dashboard">Home</Link>
            </li>
            <li className={pathname === "/dashboard/clients" ? styles.active : ""}>
              <Link href="/dashboard/clients">Clients</Link>
            </li>
            <li className={pathname === "/dashboard/employees" ? styles.active : ""}>
              <Link href="/dashboard/employees">Employees</Link>
            </li>
            {user?.role !== "manager" && (
              <li className={pathname === "/dashboard/reports" ? styles.active : ""}>
                <Link href="/dashboard/reports">Reports</Link>
              </li>
            )}
          </ul>
        </nav>
      )}

      <div style={{ marginTop: "auto", textAlign: "center" }}>
        <button onClick={toggleTheme} className={styles.themeToggle}>
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
