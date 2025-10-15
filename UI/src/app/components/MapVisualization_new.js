"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./MapVisualization.module.css";

const MapVisualization = ({
  route,
  locations,
  selectedStart,
  selectedEnd,
  mapData,
}) => {
  const canvasRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});
  const [connections, setConnections] = useState({});

  // Initialize connections from mapData or use default
  useEffect(() => {
    if (mapData && mapData.graphData) {
      setConnections(mapData.graphData);
    } else {
      // Default hardcoded map
      setConnections({
        "Main Hall": {
          Library: 2,
          Cafeteria: 3,
          "Lab Block": 4,
          Auditorium: 5,
          "Admin Office": 3,
          "Student Center": 4,
        },
        Library: {
          "Main Hall": 2,
          "Admin Office": 3,
          "Study Rooms": 2,
          "Computer Lab": 4,
        },
        "Lab Block": {
          "Main Hall": 4,
          Gym: 2,
          "Computer Lab": 3,
          "Engineering Building": 5,
          "Science Building": 4,
        },
        "Computer Lab": {
          Library: 4,
          "Lab Block": 3,
          "Engineering Building": 2,
          "Study Rooms": 3,
        },
        "Engineering Building": {
          "Lab Block": 5,
          "Computer Lab": 2,
          "Science Building": 3,
          Workshop: 4,
        },
        "Science Building": {
          "Lab Block": 4,
          "Engineering Building": 3,
          "Medical Center": 6,
          "Research Center": 4,
        },
        Cafeteria: {
          "Main Hall": 3,
          "Student Center": 2,
          Gym: 4,
          Dormitory: 5,
        },
        "Student Center": {
          "Main Hall": 4,
          Cafeteria: 2,
          Auditorium: 3,
          Dormitory: 4,
          "Sports Complex": 6,
        },
        Gym: {
          "Lab Block": 2,
          "Parking Lot": 3,
          Cafeteria: 4,
          "Sports Complex": 2,
        },
        "Sports Complex": {
          Gym: 2,
          "Student Center": 6,
          "Parking Lot": 4,
          Dormitory: 5,
        },
        "Admin Office": {
          Library: 3,
          "Main Hall": 3,
          "Medical Center": 4,
        },
        "Medical Center": {
          "Admin Office": 4,
          "Science Building": 6,
        },
        Auditorium: {
          "Main Hall": 5,
          "Student Center": 3,
        },
        Dormitory: {
          Cafeteria: 5,
          "Student Center": 4,
          "Sports Complex": 5,
        },
        "Parking Lot": {
          Gym: 3,
          "Sports Complex": 4,
        },
        "Study Rooms": {
          Library: 2,
          "Computer Lab": 3,
        },
        Workshop: {
          "Engineering Building": 4,
        },
        "Research Center": {
          "Science Building": 4,
        },
      });
    }
  }, [mapData]);

  // Generate node positions based on locations (client-side only)
  useEffect(() => {
    if (!locations || locations.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 250;

    const positions = {};

    locations.forEach((location, index) => {
      // Circular layout around center
      const angle = (index / locations.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      positions[location] = { x, y };
    });

    setNodePositions(positions);
  }, [locations]);

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = "rgba(200, 200, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    if (Object.keys(nodePositions).length === 0) return;

    // Draw all edges first
    Object.keys(connections).forEach((from) => {
      Object.keys(connections[from]).forEach((to) => {
        if (nodePositions[from] && nodePositions[to]) {
          const fromPos = nodePositions[from];
          const toPos = nodePositions[to];
          const distance = connections[from][to];

          // Check if this edge is part of the route
          const isInRoute =
            route?.path &&
            route.path.some(
              (loc, i) =>
                i < route.path.length - 1 &&
                ((route.path[i] === from && route.path[i + 1] === to) ||
                  (route.path[i] === to && route.path[i + 1] === from))
            );

          // Draw edge
          ctx.beginPath();
          ctx.moveTo(fromPos.x, fromPos.y);
          ctx.lineTo(toPos.x, toPos.y);

          if (isInRoute) {
            // Highlight route edges
            ctx.strokeStyle = "#4CAF50";
            ctx.lineWidth = 4;
          } else {
            ctx.strokeStyle = "rgba(100, 100, 150, 0.3)";
            ctx.lineWidth = 2;
          }
          ctx.stroke();

          // Draw distance label
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;

          ctx.fillStyle = isInRoute ? "#4CAF50" : "#666";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(distance.toString(), midX, midY - 5);
        }
      });
    });

    // Draw all nodes
    Object.keys(nodePositions).forEach((location) => {
      const pos = nodePositions[location];

      // Determine node color
      let nodeColor = "#6200ea";
      if (location === selectedStart) {
        nodeColor = "#00C853"; // Green for start
      } else if (location === selectedEnd) {
        nodeColor = "#D32F2F"; // Red for end
      } else if (route?.path && route.path.includes(location)) {
        nodeColor = "#FF9800"; // Orange for path nodes
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Highlight hovered node
      if (hoveredLocation === location) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw location label
      ctx.fillStyle = "#333";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(location, pos.x, pos.y + 40);
    });
  }, [
    nodePositions,
    connections,
    route,
    selectedStart,
    selectedEnd,
    hoveredLocation,
  ]);

  // Handle mouse move for hover effects
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Check if hovering over a node
    let foundHover = null;
    Object.keys(nodePositions).forEach((location) => {
      const pos = nodePositions[location];
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (distance < 20) {
        foundHover = location;
      }
    });

    setHoveredLocation(foundHover);
  };

  return (
    <div className={styles.visualizationContainer}>
      <canvas
        ref={canvasRef}
        width={1400}
        height={1000}
        className={styles.mapCanvas}
        onMouseMove={handleMouseMove}
        style={{ cursor: hoveredLocation ? "pointer" : "default" }}
      />

      {hoveredLocation && (
        <div
          className={styles.tooltip}
          style={{
            left: mousePos.x + 20,
            top: mousePos.y - 10,
          }}
        >
          <strong>{hoveredLocation}</strong>
          {connections[hoveredLocation] && (
            <div className={styles.tooltipConnections}>
              <small>Connected to:</small>
              <ul>
                {Object.keys(connections[hoveredLocation]).map((conn) => (
                  <li key={conn}>
                    {conn} ({connections[hoveredLocation][conn]} units)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ background: "#00C853" }}
          ></div>
          <span>Start Location</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ background: "#D32F2F" }}
          ></div>
          <span>End Location</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ background: "#FF9800" }}
          ></div>
          <span>Path Nodes</span>
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendColor}
            style={{ background: "#6200ea" }}
          ></div>
          <span>Other Nodes</span>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;
