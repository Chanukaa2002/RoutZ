"use client";
import { useRouter } from "next/navigation";
import styles from "./landing.module.css";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.landingContainer}>
      <div className={styles.hero}>
        <div className={styles.logoSection}>
          <Image
            src="/nav.gif"
            alt="RoutZ Icon"
            width={100}
            height={100}
            className={styles.heroLogo}
          />
          <h1 className={styles.heroTitle}>RoutZ</h1>
          <p className={styles.heroSubtitle}>
            Find the shortest path between any two locations
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.primaryButton}
            onClick={() => router.push("/user")}
          >
            Getting Started
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => router.push("/login")}
          >
            Admin Sign In
          </button>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🗺️</div>
            <h3>Interactive Maps</h3>
            <p>Visualize routes on interactive campus maps</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Fast Algorithm</h3>
            <p>Dijkstra&apos;s algorithm for optimal paths</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Search History</h3>
            <p>Track and manage your search history</p>
          </div>
        </div>
      </div>
    </div>
  );
}
