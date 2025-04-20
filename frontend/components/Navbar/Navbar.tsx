'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/api";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

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
  }, [pathname]);

  const onLogout = async () => {
    setLoggingOut(true);
    await logout();
    setUser(null);
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path ? styles.activeLink : "";

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <span className={styles.logoLine1}>DanSaviour</span>
          <span className={styles.logoLine2}>Enterprise</span>
        </Link>
      </div>

      <nav className={styles.navContainer} aria-label="Main Navigation">
        <ul className={styles.navLinks}>
          <li className={isActive("/")}>
            <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
          </li>

          {loading ? (
            <li>Loading...</li>
          ) : user ? (
            <>
              <li className={isActive("/dashboard")}>
                <Link href="/dashboard" aria-current={pathname === "/dashboard" ? "page" : undefined}>Dashboard</Link>
              </li>

              {user.role === "director" && (
                <li className={isActive("/admin")}>
                  <Link href="/admin" aria-current={pathname === "/admin" ? "page" : undefined}>Admin</Link>
                </li>
              )}

              <li>
                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className={styles.logoutButton}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </li>
            </>
          ) : (
            <li className={isActive("/login")}>
              <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined}>Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
