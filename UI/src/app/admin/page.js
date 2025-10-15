"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapAuthProvider, useMapAuth } from "../components/MapAuthProvider";
import MapManager from "../components/MapManager";
import { signOut } from "firebase/auth";
import styles from "./admin.module.css";

function AdminContent() {
  const { user, idToken, loading, auth } = useMapAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !idToken) {
    return null;
  }

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Admin Dashboard</h1>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <MapManager user={user} idToken={idToken} />
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <MapAuthProvider>
      <AdminContent />
    </MapAuthProvider>
  );
}
