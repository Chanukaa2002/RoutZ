import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner({ size = "medium" }) {
  return (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div className={styles.circle}></div>
    </div>
  );
}
