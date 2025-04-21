'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";
import { login } from "@/lib/api";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Send credentials; server sets the HttpOnly session cookie
      await login({ username, password });

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Login failed:", err);
        setError(err.message || "Invalid username or password");
      } else {
        console.error("Login failed with unknown error:", err);
        setError("Invalid username or password");
      }
    } finally {
      setLoading(false);
    }    
  };

  return (
    <div className={styles.loginFormContainer}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
