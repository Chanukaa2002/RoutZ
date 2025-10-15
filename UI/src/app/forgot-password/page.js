"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { MapAuthProvider, useMapAuth } from "../components/MapAuthProvider";
import styles from "../components/Auth.module.css";

export const dynamic = 'force-dynamic';

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { auth } = useMapAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2 className={styles.authTitle}>Reset Password</h2>
          <p className={styles.authSubtitle}>
            Enter your email to receive reset instructions
          </p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {message && <div className={styles.successMessage}>{message}</div>}

        <form onSubmit={handleReset} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        <div className={styles.authLinks}>
          <a href="/login">Back to Login</a>
        </div>

        <div className={styles.backLink}>
          <a href="/">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <MapAuthProvider>
      <ForgotPasswordContent />
    </MapAuthProvider>
  );
}
