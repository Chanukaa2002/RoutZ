import { useState } from "react";
import styles from "./Demo.module.css";
import Image from "next/image";

export default function Demo({ onDemoSelect }) {
  const [isVisible, setIsVisible] = useState(true);

  const demoRoutes = [
    { start: "Library", end: "Gym", description: "Quick route to the gym" },
    { start: "Main Hall", end: "Cafeteria", description: "Grab some food" },
    { start: "Parking Lot", end: "Auditorium", description: "Attend an event" },
    { start: "Admin Office", end: "Lab Block", description: "Head to classes" },
  ];

  const handleDemoClick = (demo) => {
    onDemoSelect(demo.start, demo.end);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.demoContainer}>
      <div className={styles.demoHeader}>
        <span className={styles.demoIcon}>
          <Image
          src="/demo.gif"
          alt="Demo Icon"
          width={35}
          height={35}
        />
        </span>
        <span>Try a demo route</span>
        <button
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
        >
          ✕
        </button>
      </div>
      <div className={styles.demoList}>
        {demoRoutes.map((demo, index) => (
          <button
            key={index}
            className={styles.demoButton}
            onClick={() => handleDemoClick(demo)}
          >
            <div className={styles.demoRoute}>
              {demo.start} → {demo.end}
            </div>
            <div className={styles.demoDescription}>{demo.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
