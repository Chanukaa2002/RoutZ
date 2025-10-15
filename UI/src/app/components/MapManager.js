import React, { useRef, useState, useEffect } from "react";
import styles from "./MapManager.module.css";

// Helper to draw nodes and edges with distance labels and better visuals
function drawGraph(ctx, nodes, edges, selectedNode, selectedEdge, hoveredNode) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw grid for better spatial awareness
  drawGrid(ctx);

  // Draw edges with distance labels
  edges.forEach((edge, idx) => {
    const n1 = nodes.find((n) => n.id === edge.from);
    const n2 = nodes.find((n) => n.id === edge.to);
    if (n1 && n2) {
      const isSelected = selectedEdge === idx;

      // Draw edge line with gradient
      const gradient = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
      gradient.addColorStop(0, isSelected ? "#f59e0b" : "#667eea");
      gradient.addColorStop(1, isSelected ? "#f59e0b" : "#764ba2");

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.shadowColor = isSelected
        ? "rgba(245, 158, 11, 0.5)"
        : "rgba(102, 126, 234, 0.3)";
      ctx.shadowBlur = isSelected ? 10 : 5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw distance label with better background
      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2;

      // Background for distance
      ctx.fillStyle = isSelected ? "#f59e0b" : "#667eea";
      ctx.beginPath();
      ctx.roundRect(midX - 22, midY - 12, 44, 24, 12);
      ctx.fill();

      // Distance text
      ctx.fillStyle = "white";
      ctx.font = "bold 13px 'Segoe UI', Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(edge.distance || "1", midX, midY);
    }
  });

  // Draw nodes with better styling
  nodes.forEach((node) => {
    const isSelected = node.id === selectedNode;
    const isHovered = node.id === hoveredNode;
    const radius = isSelected || isHovered ? 26 : 24;

    // Node shadow
    ctx.shadowColor = isSelected
      ? "rgba(102, 126, 234, 0.6)"
      : "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = isSelected ? 15 : 8;

    // Outer glow for selected/hovered
    if (isSelected || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
      const glowGradient = ctx.createRadialGradient(
        node.x,
        node.y,
        radius,
        node.x,
        node.y,
        radius + 5
      );
      glowGradient.addColorStop(
        0,
        isSelected ? "rgba(102, 126, 234, 0.4)" : "rgba(102, 126, 234, 0.2)"
      );
      glowGradient.addColorStop(1, "rgba(102, 126, 234, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }

    // Node circle with gradient
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);

    if (isSelected) {
      const gradient = ctx.createRadialGradient(
        node.x,
        node.y,
        0,
        node.x,
        node.y,
        radius
      );
      gradient.addColorStop(0, "#764ba2");
      gradient.addColorStop(1, "#667eea");
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = "white";
    }

    ctx.fill();

    // Node border
    ctx.strokeStyle = isSelected ? "#764ba2" : "#667eea";
    ctx.lineWidth = isSelected ? 4 : 3;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Node label
    ctx.fillStyle = isSelected ? "white" : "#667eea";
    ctx.font = isSelected
      ? "bold 17px 'Segoe UI', Arial"
      : "bold 16px 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x, node.y);
  });
}

// Helper to draw grid background
function drawGrid(ctx) {
  const gridSize = 30;
  ctx.strokeStyle = "#e8eaf0";
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= ctx.canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= ctx.canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }
}

export default function MapManager({ user, idToken }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mapName, setMapName] = useState("");
  const [mapId, setMapId] = useState("");
  const [maps, setMaps] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);

  // Node creation states
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [nodeLabel, setNodeLabel] = useState("");
  const [pendingNodePos, setPendingNodePos] = useState(null);

  // Edge creation states
  const [showEdgeForm, setShowEdgeForm] = useState(false);
  const [edgeStart, setEdgeStart] = useState(null);
  const [edgeEnd, setEdgeEnd] = useState(null);
  const [edgeDistance, setEdgeDistance] = useState("");

  // Mode state for better UX
  const [mode, setMode] = useState("select"); // "select", "addNode", "addEdge"

  // Draw graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Enable smooth rendering
    if (ctx.roundRect === undefined) {
      ctx.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }

    drawGraph(ctx, nodes, edges, selectedNode, selectedEdge, hoveredNode);
  }, [nodes, edges, selectedNode, selectedEdge, hoveredNode]);

  // Handle mouse move for hover effect
  function handleCanvasMouseMove(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hovered = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 26);
    setHoveredNode(hovered ? hovered.id : null);
  }

  // Handle canvas click
  function handleCanvasClick(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    const clicked = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 25);

    if (clicked) {
      // Node clicked
      if (edgeStart && edgeStart !== clicked.id) {
        // Second node for edge - show edge form
        setEdgeEnd(clicked.id);
        setShowEdgeForm(true);
        setSelectedNode(null);
        setSelectedEdge(null);
      } else if (!edgeStart) {
        // First node for edge
        setEdgeStart(clicked.id);
        setSelectedNode(clicked.id);
        setSelectedEdge(null);
      }
    } else {
      // Empty space clicked - add node
      setPendingNodePos({ x, y });
      setShowNodeForm(true);
      setEdgeStart(null);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }

  // Add node with label
  function addNode() {
    if (!nodeLabel.trim() || !pendingNodePos) {
      showMessage("Please enter a node label", "error");
      return;
    }

    // Check for duplicate labels
    if (
      nodes.some(
        (n) => n.label.toLowerCase() === nodeLabel.trim().toLowerCase()
      )
    ) {
      showMessage("Node label already exists! Use a unique label.", "error");
      return;
    }

    const newId = `N${nodes.length + 1}`;
    setNodes((nds) => [
      ...nds,
      {
        id: newId,
        label: nodeLabel.trim(),
        x: pendingNodePos.x,
        y: pendingNodePos.y,
      },
    ]);
    setShowNodeForm(false);
    setNodeLabel("");
    setPendingNodePos(null);
    showMessage(
      `Node "${nodeLabel.trim()}" added! Click another spot or connect nodes.`,
      "success"
    );
  }

  // Show message helper
  function showMessage(msg, type = "success") {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 4000);
  }

  // Cancel node form
  function cancelNodeForm() {
    setShowNodeForm(false);
    setNodeLabel("");
    setPendingNodePos(null);
  }

  // Add edge with distance
  function addEdge() {
    const distance = parseFloat(edgeDistance);
    if (!distance || distance <= 0) {
      setMessage("Please enter a valid distance");
      return;
    }
    setEdges((eds) => [...eds, { from: edgeStart, to: edgeEnd, distance }]);
    setShowEdgeForm(false);
    setEdgeDistance("");
    setEdgeStart(null);
    setEdgeEnd(null);
    setMessage("Edge added!");
  }

  // Cancel edge form
  function cancelEdgeForm() {
    setShowEdgeForm(false);
    setEdgeDistance("");
    setEdgeStart(null);
    setEdgeEnd(null);
  }

  // Delete selected node
  function deleteSelectedNode() {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
    setEdges((eds) =>
      eds.filter((e) => e.from !== selectedNode && e.to !== selectedNode)
    );
    setSelectedNode(null);
    setMessage("Node deleted");
  }

  // Delete selected edge
  function deleteSelectedEdge() {
    if (selectedEdge === null) return;
    setEdges((eds) => eds.filter((_, idx) => idx !== selectedEdge));
    setSelectedEdge(null);
    setMessage("Edge deleted");
  }

  // Select an edge
  function selectEdge(index) {
    setSelectedEdge(index);
    setSelectedNode(null);
  }

  // Clear canvas
  function clearCanvas() {
    if (confirm("Clear all nodes and edges?")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setSelectedEdge(null);
      setEdgeStart(null);
      setMessage("Canvas cleared");
    }
  }

  // Save map to backend
  async function saveMap() {
    if (!mapId.trim() || !mapName.trim()) {
      setMessage("Map ID and name are required");
      return;
    }
    if (nodes.length < 2) {
      setMessage("At least 2 nodes are required");
      return;
    }
    if (edges.length < 1) {
      setMessage("At least 1 edge is required");
      return;
    }

    // Convert to adjacency list with distances
    const graphData = {};
    nodes.forEach((n) => {
      graphData[n.label] = {};
    });
    edges.forEach((e) => {
      const n1 = nodes.find((n) => n.id === e.from);
      const n2 = nodes.find((n) => n.id === e.to);
      if (n1 && n2) {
        graphData[n1.label][n2.label] = e.distance;
        graphData[n2.label][n1.label] = e.distance;
      }
    });

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5001/api/graph/add-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          mapId: mapId.trim(),
          mapName: mapName.trim(),
          graphData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Map saved successfully!");
        fetchMaps();
        // Clear form
        setNodes([]);
        setEdges([]);
        setMapId("");
        setMapName("");
      } else {
        setMessage(`❌ ${data.message || "Failed to save map"}`);
      }
    } catch (e) {
      setMessage("❌ Error saving map");
      console.error(e);
    }
    setLoading(false);
  }

  // Load a map into the editor
  function loadMap(map) {
    if (!map.graphData) return;

    // Convert adjacency list back to nodes and edges
    const nodeLabels = Object.keys(map.graphData);
    const newNodes = nodeLabels.map((label, idx) => ({
      id: `N${idx + 1}`,
      label,
      x: 100 + (idx % 5) * 70,
      y: 100 + Math.floor(idx / 5) * 70,
    }));

    const newEdges = [];
    const processed = new Set();
    nodeLabels.forEach((label1) => {
      Object.entries(map.graphData[label1]).forEach(([label2, distance]) => {
        const key = [label1, label2].sort().join("-");
        if (!processed.has(key)) {
          const n1 = newNodes.find((n) => n.label === label1);
          const n2 = newNodes.find((n) => n.label === label2);
          if (n1 && n2) {
            newEdges.push({ from: n1.id, to: n2.id, distance });
            processed.add(key);
          }
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setMapId(map.mapId);
    setMapName(map.mapName);
    setMessage(`Loaded map: ${map.mapName}`);
  }

  // Fetch maps owned by this admin
  async function fetchMaps() {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5001/api/graph/my-maps?uid=${user.uid}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      const data = await res.json();
      if (data.success) setMaps(data.maps);
      else setMaps([]);
    } catch {
      setMaps([]);
    }
    setLoading(false);
  }

  // Delete a map
  async function deleteMap(id) {
    if (!confirm(`Delete map "${id}"?`)) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `http://localhost:5001/api/graph/delete-map/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Map deleted");
        fetchMaps();
      } else {
        setMessage(`❌ ${data.message || "Failed to delete"}`);
      }
    } catch {
      setMessage("❌ Error deleting map");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (user && idToken) fetchMaps();
    // eslint-disable-next-line
  }, [user, idToken]);

  return (
    <div className={styles.managerContainer}>
      <div className={styles.managerHeader}>
        <h2>🗺️ Map Creator Studio</h2>
        <p>Create interactive maps with custom nodes and weighted edges</p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={
            messageType === "success"
              ? styles.successMessage
              : styles.errorMessage
          }
        >
          {message}
        </div>
      )}

      <div className={styles.managerContent}>
        {/* Canvas Section */}
        <div className={styles.canvasSection}>
          <div className={styles.canvasHeader}>
            <h3>📍 Canvas</h3>
            <div className={styles.canvasInstructions}>
              <p>
                🖱️ <strong>Click empty space</strong> to add node
              </p>
              <p>
                🔗 <strong>Click 2 nodes</strong> to create edge
              </p>
            </div>
          </div>

          <div className={styles.canvasWrapper}>
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className={styles.canvas}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
            />
          </div>

          {/* Controls */}
          <div className={styles.canvasControls}>
            <button
              onClick={deleteSelectedNode}
              disabled={!selectedNode}
              className={styles.deleteButton}
            >
              🗑️ Delete Node{" "}
              {selectedNode &&
                `(${nodes.find((n) => n.id === selectedNode)?.label})`}
            </button>
            <button
              onClick={deleteSelectedEdge}
              disabled={selectedEdge === null}
              className={styles.deleteButton}
            >
              🗑️ Delete Edge{" "}
              {selectedEdge !== null && `(${edges[selectedEdge]?.distance})`}
            </button>
            <button onClick={clearCanvas} className={styles.clearButton}>
              🧹 Clear Canvas
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Graph Stats */}
          <div className={styles.formCard}>
            <h3>📊 Graph Statistics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Nodes</div>
                <div className={styles.statValue}>{nodes.length}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Edges</div>
                <div className={styles.statValue}>{edges.length}</div>
              </div>
            </div>
          </div>

          {/* Edges List */}
          {edges.length > 0 && (
            <div className={styles.formCard}>
              <h3>🔗 Edge Connections</h3>
              <div className={styles.edgesList}>
                {edges.map((edge, idx) => {
                  const n1 = nodes.find((n) => n.id === edge.from);
                  const n2 = nodes.find((n) => n.id === edge.to);
                  return (
                    <div
                      key={idx}
                      className={`${styles.edgeItem} ${
                        selectedEdge === idx ? styles.selectedEdge : ""
                      }`}
                      onClick={() => selectEdge(idx)}
                    >
                      <span>
                        <strong>{n1?.label}</strong> ↔{" "}
                        <strong>{n2?.label}</strong>
                      </span>
                      <span className={styles.edgeDistance}>
                        {edge.distance}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save Form */}
          <div className={styles.formCard}>
            <h3>💾 Save Map</h3>
            <div className={styles.formGroup}>
              <label>Map Name</label>
              <input
                className={styles.input}
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                placeholder="e.g., City Center Network"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Map ID (unique)</label>
              <input
                className={styles.input}
                value={mapId}
                onChange={(e) => setMapId(e.target.value)}
                placeholder="e.g., city-center-01"
              />
            </div>
            <button
              className={styles.saveButton}
              onClick={saveMap}
              disabled={loading || nodes.length < 2 || edges.length < 1}
            >
              {loading ? "💫 Saving..." : "💾 Save Map to Database"}
            </button>
            {nodes.length < 2 && (
              <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                Need at least 2 nodes
              </p>
            )}
            {edges.length < 1 && nodes.length >= 2 && (
              <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                Need at least 1 edge
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Node Form Modal */}
      {showNodeForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>➕ Add New Node</h3>
            <p
              style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}
            >
              Enter a unique label for this node (e.g., A, Station1, Point_X)
            </p>
            <div className={styles.formGroup}>
              <label>Node Label</label>
              <input
                className={styles.input}
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                placeholder="e.g., A, B, Station1"
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && addNode()}
              />
            </div>
            <div className={styles.formActions}>
              <button className={styles.primaryButton} onClick={addNode}>
                ✅ Add Node
              </button>
              <button
                className={styles.secondaryButton}
                onClick={cancelNodeForm}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edge Form Modal */}
      {showEdgeForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>🔗 Create Edge Connection</h3>
            <div className={styles.edgeInfo}>
              <p>
                From:{" "}
                <strong>{nodes.find((n) => n.id === edgeStart)?.label}</strong>
                {" → "}
                To:{" "}
                <strong>{nodes.find((n) => n.id === edgeEnd)?.label}</strong>
              </p>
            </div>
            <div className={styles.formGroup}>
              <label>Distance / Weight</label>
              <input
                className={styles.input}
                type="number"
                min="0.1"
                step="0.1"
                value={edgeDistance}
                onChange={(e) => setEdgeDistance(e.target.value)}
                placeholder="e.g., 5.5, 10, 3.2"
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && addEdge()}
              />
              <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                💡 Tip: Use decimal numbers for precise distances (e.g., 5.5 km)
              </p>
            </div>
            <div className={styles.formActions}>
              <button className={styles.primaryButton} onClick={addEdge}>
                ✅ Create Edge
              </button>
              <button
                className={styles.secondaryButton}
                onClick={cancelEdgeForm}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Maps */}
      <div className={styles.savedMaps}>
        <h3>📚 My Saved Maps ({maps.length})</h3>
        {loading && <div>Loading maps...</div>}
        {!loading && maps.length === 0 && (
          <div className={styles.noMaps}>
            <p>📭 No maps saved yet.</p>
            <p>Create your first map using the canvas above!</p>
          </div>
        )}
        {!loading && maps.length > 0 && (
          <div className={styles.mapsGrid}>
            {maps.map((m) => (
              <div key={m.mapId} className={styles.mapCard}>
                <div className={styles.mapHeader}>
                  <h4>{m.mapName}</h4>
                  <p className={styles.mapId}>ID: {m.mapId}</p>
                </div>
                <div className={styles.mapStats}>
                  <span>📍 {Object.keys(m.graphData || {}).length} nodes</span>
                  <span>
                    🔗{" "}
                    {Object.values(m.graphData || {}).reduce(
                      (acc, edges) => acc + Object.keys(edges).length,
                      0
                    ) / 2}{" "}
                    edges
                  </span>
                </div>
                <div className={styles.mapActions}>
                  <button
                    className={styles.loadButton}
                    onClick={() => loadMap(m)}
                  >
                    📝 Edit
                  </button>
                  <button
                    className={styles.deleteMapButton}
                    onClick={() => deleteMap(m.mapId)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
