import { useEffect, useRef, useState } from "react";
import styles from "./MapVisualization.module.css";

const MapVisualization = ({ route, locations, selectedStart, selectedEnd }) => {
  const canvasRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Map data - coordinates for each location (well-spaced campus layout)
  const locationCoords = {
    // Central Hub Area
    "Main Hall": { x: 600, y: 400 },

    // Academic Zone (Top - North Campus)
    "Study Rooms": { x: 200, y: 150 },
    Library: { x: 400, y: 200 },
    "Computer Lab": { x: 600, y: 150 },
    "Engineering Building": { x: 800, y: 200 },
    Workshop: { x: 900, y: 100 },
    "Lab Block": { x: 500, y: 300 },
    "Science Building": { x: 800, y: 350 },
    "Research Center": { x: 1000, y: 250 },

    // Administrative Zone (West Campus)
    "Admin Office": { x: 200, y: 350 },
    "Medical Center": { x: 100, y: 500 },

    // Student Life Zone (East Campus)
    "Student Center": { x: 800, y: 450 },
    Auditorium: { x: 900, y: 400 },

    // Recreation Zone (South Campus)
    Cafeteria: { x: 500, y: 550 },
    Gym: { x: 650, y: 650 },
    "Sports Complex": { x: 900, y: 600 },

    // Residential Zone (Southwest Campus)
    Dormitory: { x: 300, y: 700 },

    // Parking Area (Southeast Campus)
    "Parking Lot": { x: 750, y: 750 },
  };

  // Connection data (edges with weights) - extracted from the graph structure
  const connections = [
    // Main Hall connections (central hub)
    { from: "Main Hall", to: "Library", weight: 2 },
    { from: "Main Hall", to: "Cafeteria", weight: 3 },
    { from: "Main Hall", to: "Lab Block", weight: 4 },
    { from: "Main Hall", to: "Auditorium", weight: 5 },
    { from: "Main Hall", to: "Admin Office", weight: 3 },
    { from: "Main Hall", to: "Student Center", weight: 4 },

    // Library area connections
    { from: "Library", to: "Admin Office", weight: 3 },
    { from: "Library", to: "Study Rooms", weight: 2 },
    { from: "Library", to: "Computer Lab", weight: 4 },

    // Academic building connections
    { from: "Lab Block", to: "Gym", weight: 2 },
    { from: "Lab Block", to: "Computer Lab", weight: 3 },
    { from: "Lab Block", to: "Engineering Building", weight: 5 },
    { from: "Lab Block", to: "Science Building", weight: 4 },

    { from: "Computer Lab", to: "Engineering Building", weight: 2 },
    { from: "Computer Lab", to: "Study Rooms", weight: 3 },

    { from: "Engineering Building", to: "Science Building", weight: 3 },
    { from: "Engineering Building", to: "Workshop", weight: 4 },

    { from: "Science Building", to: "Medical Center", weight: 6 },
    { from: "Science Building", to: "Research Center", weight: 4 },

    // Student life connections
    { from: "Cafeteria", to: "Student Center", weight: 2 },
    { from: "Cafeteria", to: "Gym", weight: 4 },
    { from: "Cafeteria", to: "Dormitory", weight: 5 },

    { from: "Student Center", to: "Auditorium", weight: 3 },
    { from: "Student Center", to: "Dormitory", weight: 4 },
    { from: "Student Center", to: "Sports Complex", weight: 6 },

    { from: "Gym", to: "Parking Lot", weight: 3 },
    { from: "Gym", to: "Sports Complex", weight: 2 },

    { from: "Sports Complex", to: "Parking Lot", weight: 4 },
    { from: "Sports Complex", to: "Dormitory", weight: 5 },

    // Administrative connections
    { from: "Admin Office", to: "Medical Center", weight: 4 },
    { from: "Medical Center", to: "Dormitory", weight: 3 },

    // Parking connections
    { from: "Dormitory", to: "Parking Lot", weight: 6 },
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size for expanded layout
    canvas.width = 1200;
    canvas.height = 900;

    // Draw preview direct line between selected start and end (if no route yet)
    if (
      !route &&
      selectedStart &&
      selectedEnd &&
      selectedStart !== selectedEnd
    ) {
      const startCoords = locationCoords[selectedStart];
      const endCoords = locationCoords[selectedEnd];

      if (startCoords && endCoords) {
        ctx.beginPath();
        ctx.setLineDash([8, 8]); // Dashed line
        ctx.moveTo(startCoords.x, startCoords.y);
        ctx.lineTo(endCoords.x, endCoords.y);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.setLineDash([]); // Reset to solid line
        ctx.globalAlpha = 1;

        // Calculate and show direct distance
        const directDistance = Math.sqrt(
          Math.pow(endCoords.x - startCoords.x, 2) +
            Math.pow(endCoords.y - startCoords.y, 2)
        ).toFixed(0);

        const midX = (startCoords.x + endCoords.x) / 2;
        const midY = (startCoords.y + endCoords.y) / 2;

        // Draw distance background
        ctx.beginPath();
        ctx.arc(midX, midY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = "#f8fafc";
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw distance text
        ctx.fillStyle = "#475569";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("?", midX, midY + 3);
      }
    }

    // Draw connections (edges)
    connections.forEach((conn) => {
      const from = locationCoords[conn.from];
      const to = locationCoords[conn.to];

      if (from && to) {
        // Check if this edge is part of the shortest path
        const isPathEdge =
          route && isEdgeInPath(conn.from, conn.to, route.path);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);

        if (isPathEdge) {
          ctx.strokeStyle = "#7c3aed";
          ctx.lineWidth = 4;
          ctx.shadowColor = "#7c3aed";
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = "#d1d5db";
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
        }

        ctx.stroke();

        // Draw edge weight with background
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        // Draw weight background circle
        ctx.beginPath();
        ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = isPathEdge ? "#ffffff" : "#f9fafb";
        ctx.fill();
        ctx.strokeStyle = isPathEdge ? "#7c3aed" : "#d1d5db";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw weight text
        ctx.fillStyle = isPathEdge ? "#7c3aed" : "#6b7280";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(conn.weight.toString(), midX, midY + 3);
      }
    });

    // Draw locations (nodes)
    Object.entries(locationCoords).forEach(([location, coords]) => {
      const isStart =
        (route && route.start === location) || selectedStart === location;
      const isEnd =
        (route && route.end === location) || selectedEnd === location;
      const isInPath = route && route.path.includes(location);
      const isSelected = selectedStart === location || selectedEnd === location;

      // Draw node circle
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 25, 0, 2 * Math.PI);

      if (isStart) {
        ctx.fillStyle = route ? "#10b981" : "#22c55e"; // Brighter green for selected start
        ctx.shadowColor = route ? "#10b981" : "#22c55e";
        ctx.shadowBlur = 12;
      } else if (isEnd) {
        ctx.fillStyle = route ? "#ef4444" : "#f87171"; // Brighter red for selected end
        ctx.shadowColor = route ? "#ef4444" : "#f87171";
        ctx.shadowBlur = 12;
      } else if (isInPath) {
        ctx.fillStyle = "#7c3aed";
        ctx.shadowColor = "#7c3aed";
        ctx.shadowBlur = 8;
      } else if (isSelected) {
        ctx.fillStyle = "#fbbf24"; // Yellow for other selected locations
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "#f3f4f6";
        ctx.shadowBlur = 0;
      }

      ctx.fill();

      // Draw node border
      ctx.strokeStyle =
        isStart || isEnd || isInPath || isSelected ? "#ffffff" : "#d1d5db";
      ctx.lineWidth = isSelected && !route ? 3 : 2; // Thicker border for selected nodes
      ctx.stroke();

      // Draw location name
      ctx.fillStyle =
        isStart || isEnd || isInPath || isSelected ? "#ffffff" : "#374151";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.shadowBlur = 0;

      // Split long location names
      const words = location.split(" ");
      if (words.length > 1) {
        ctx.fillText(words[0], coords.x, coords.y - 3);
        ctx.fillText(words[1], coords.x, coords.y + 8);
      } else {
        ctx.fillText(location, coords.x, coords.y + 3);
      }
    });

    // Draw path arrows if route exists
    if (route && route.path.length > 1) {
      drawPathArrows(ctx, route.path);
    }
  }, [route, selectedStart, selectedEnd]);

  const isEdgeInPath = (from, to, path) => {
    if (!path || path.length < 2) return false;

    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === from && path[i + 1] === to) ||
        (path[i] === to && path[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  const drawPathArrows = (ctx, path) => {
    for (let i = 0; i < path.length - 1; i++) {
      const from = locationCoords[path[i]];
      const to = locationCoords[path[i + 1]];

      if (from && to) {
        // Calculate arrow position (closer to destination)
        const arrowX = from.x + 0.7 * (to.x - from.x);
        const arrowY = from.y + 0.7 * (to.y - from.y);

        // Calculate arrow angle
        const angle = Math.atan2(to.y - from.y, to.x - from.x);

        // Draw arrow
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-15, -8);
        ctx.lineTo(-15, 8);
        ctx.closePath();

        ctx.fillStyle = "#7c3aed";
        ctx.fill();

        ctx.restore();
      }
    }
  };

  const handleMouseMove = (event) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    setMousePos({ x: event.clientX, y: event.clientY });

    // Check if mouse is over any location
    let foundLocation = null;
    Object.entries(locationCoords).forEach(([location, coords]) => {
      const distance = Math.sqrt(
        Math.pow(mouseX - coords.x, 2) + Math.pow(mouseY - coords.y, 2)
      );
      if (distance <= 25) {
        foundLocation = location;
      }
    });

    setHoveredLocation(foundLocation);
  };

  const handleMouseLeave = () => {
    setHoveredLocation(null);
  };

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapHeader}>
        <h3>Campus Map</h3>
        <div className={styles.mapLegend}>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: route ? "#10b981" : "#22c55e" }}
            ></div>
            <span>Start {selectedStart && !route && "(Selected)"}</span>
          </div>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: route ? "#ef4444" : "#f87171" }}
            ></div>
            <span>End {selectedEnd && !route && "(Selected)"}</span>
          </div>
          {route && (
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: "#7c3aed" }}
              ></div>
              <span>Optimal Path</span>
            </div>
          )}
          {!route && selectedStart && selectedEnd && (
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: "#94a3b8", opacity: 0.6 }}
              ></div>
              <span>Direct Line</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.mapCanvas}
          width={1200}
          height={900}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {hoveredLocation && (
          <div
            className={styles.tooltip}
            style={{
              left: mousePos.x + 10,
              top: mousePos.y - 10,
            }}
          >
            <div className={styles.tooltipHeader}>{hoveredLocation}</div>
            {(route && route.path.includes(hoveredLocation)) ||
            selectedStart === hoveredLocation ||
            selectedEnd === hoveredLocation ? (
              <div className={styles.tooltipContent}>
                {((route && route.start === hoveredLocation) ||
                  selectedStart === hoveredLocation) &&
                  "🚩 Start Location"}
                {((route && route.end === hoveredLocation) ||
                  selectedEnd === hoveredLocation) &&
                  "🏁 End Location"}
                {route &&
                  route.start !== hoveredLocation &&
                  route.end !== hoveredLocation &&
                  route.path.includes(hoveredLocation) &&
                  "📍 On Route"}
                {!route &&
                  selectedStart !== hoveredLocation &&
                  selectedEnd !== hoveredLocation &&
                  (selectedStart === hoveredLocation ||
                    selectedEnd === hoveredLocation) &&
                  "⭐ Selected"}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className={styles.mapStats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {Object.keys(locationCoords).length}
            </div>
            <div className={styles.statLabel}>Locations</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{connections.length}</div>
            <div className={styles.statLabel}>Connections</div>
          </div>
          {route && (
            <>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{route.distance}</div>
                <div className={styles.statLabel}>Distance (units)</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{route.path.length}</div>
                <div className={styles.statLabel}>Stops</div>
              </div>
            </>
          )}
        </div>

        {route && (
          <div className={styles.routeInfo}>
            <div className={styles.routeDetail}>
              <strong>Optimal Route:</strong> {route.path.join(" → ")}
            </div>
            <div className={styles.routeDetail}>
              <strong>Algorithm Used:</strong> {route.algorithm}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapVisualization;
