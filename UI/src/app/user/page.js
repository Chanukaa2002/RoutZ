"use client";
import { useState, useEffect } from "react";
import styles from "../page_new.module.css";
import LoadingSpinner from "../components/LoadingSpinner";
// import Demo from "../components/Demo";
import dynamic from "next/dynamic";
import Image from "next/image";

// Import MapVisualization dynamically with no SSR to prevent hydration errors
const MapVisualization = dynamic(
  () => import("../components/MapVisualization"),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

// const API_BASE_URL = "http://localhost:5001/api";
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? "http://localhost:5001/api" 
  : "/api";

export default function UserPage() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [route, setRoute] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [availableMaps, setAvailableMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState("");
  const [selectedMapData, setSelectedMapData] = useState(null);

  useEffect(() => {
    fetchAvailableMaps();
    fetchLocations();
    fetchHistory();
    checkUndoStatus();
  }, []);

  // Fetch map data when selectedMapId changes
  useEffect(() => {
    if (selectedMapId) {
      fetchMapData(selectedMapId);
    } else {
      setSelectedMapData(null);
      setLocations([]);
    }
  }, [selectedMapId]);

  const fetchAvailableMaps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/graph/maps`);
      const data = await response.json();
      if (data.success && data.maps) {
        setAvailableMaps(data.maps);
        // Select the first map by default if available
        if (data.maps.length > 0) {
          setSelectedMapId(data.maps[0].mapId);
        }
      }
    } catch (error) {
      console.error("Error fetching maps:", error);
    }
  };

  const fetchMapData = async (mapId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/graph/maps/${mapId}`);
      const data = await response.json();
      if (data.success && data.map) {
        setSelectedMapData(data.map);
        // Extract locations from graphData
        if (data.map.graphData) {
          const nodeNames = Object.keys(data.map.graphData);
          setLocations(nodeNames);
        }
        // Clear previous selections when changing map
        setStartLocation("");
        setEndLocation("");
        setRoute(null);
      }
    } catch (error) {
      console.error("Error fetching map data:", error);
      setError("Failed to load map data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ds/sort-locations`);
      const data = await response.json();
      if (data.success) {
        setLocations(data.sortedLocations);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ds/search-history`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
        setHistoryCount(data.totalSearches || 0);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const checkUndoStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ds/can-undo`);
      const data = await response.json();
      if (data.success) {
        setCanUndo(data.canUndo);
        setHistoryCount(data.historyCount || 0);
      }
    } catch (error) {
      console.error("Error checking undo status:", error);
    }
  };

  const findShortestPath = async () => {
    if (!startLocation || !endLocation) {
      setError("Please select both start and end locations");
      return;
    }

    if (startLocation === endLocation) {
      setError("Start and end locations cannot be the same");
      return;
    }

    if (!selectedMapId) {
      setError("Please select a map");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/graph/shortest-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startLocation,
          end: endLocation,
          mapId: selectedMapId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRoute(data);
        fetchHistory();
        checkUndoStatus();
      } else {
        setError(data.error || "Failed to find path");
      }
    } catch (error) {
      setError("Network error. Please check if the server is running.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setError("");
  };

  const undoLastSearch = async () => {
    if (!canUndo) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ds/undo`, {
        method: "POST",
      });

      const data = await response.json();
      if (data.success && data.previousSearch) {
        setStartLocation(data.previousSearch.start);
        setEndLocation(data.previousSearch.destination);
        setRoute({
          success: true,
          start: data.previousSearch.start,
          end: data.previousSearch.destination,
          path: data.previousSearch.path,
          distance: data.previousSearch.distance,
          algorithm:
            data.previousSearch.visualizationData?.algorithm || "Dijkstra",
        });

        fetchHistory();
        checkUndoStatus();
        setError("");
      } else {
        setError(data.message || "Failed to undo");
      }
    } catch (error) {
      setError("Network error during undo operation");
      console.error("Undo error:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ds/clear-history`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setHistory([]);
        setCanUndo(false);
        setHistoryCount(0);
        setError("");
      } else {
        setError(data.message || "Failed to clear history");
      }
    } catch (error) {
      setError("Network error during clear operation");
      console.error("Clear history error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (start, end) => {
    setStartLocation(start);
    setEndLocation(end);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>
              <Image src="/nav.gif" alt="RoutZ Icon" width={45} height={45} />
            </span>
            <span className={styles.logoText}>RoutZ</span>
          </div>
        </div>
        <div className={styles.content}>
          <h2 className={styles.title}>Find your Location</h2>

          {/* Map Selection */}
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Select Map</label>
              <select
                className={styles.select}
                value={selectedMapId}
                onChange={(e) => setSelectedMapId(e.target.value)}
              >
                <option value="">Choose a map</option>
                {availableMaps.map((map) => (
                  <option key={map.mapId} value={map.mapId}>
                    {map.mapName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Start</label>
              <select
                className={styles.select}
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>End</label>
              <select
                className={styles.select}
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className={styles.findButton}
            onClick={findShortestPath}
            disabled={loading || !startLocation || !endLocation}
          >
            {loading ? (
              <LoadingSpinner size="small" />
            ) : (
              <span className={styles.buttonIcon}></span>
            )}
            {loading ? "Finding..." : "Find Shortest Path"}
          </button>
          <div className={styles.historyControls}>
            <h3 className={styles.historyTitle}>
              <span className={styles.historyIcon}>
                <Image
                  src="/clock.gif"
                  alt="History Icon"
                  width={35}
                  height={35}
                />
              </span>
              History & Controls
            </h3>
            <div className={styles.controlButtons}>
              <button
                className={`${styles.undoButton} ${
                  !canUndo ? styles.disabled : ""
                }`}
                onClick={undoLastSearch}
                disabled={!canUndo || loading}
                title={canUndo ? "Undo Last Search" : "No searches to undo"}
              >
                Undo Last Search
              </button>
              <button
                className={`${styles.clearButton} ${
                  historyCount === 0 ? styles.disabled : ""
                }`}
                onClick={clearHistory}
                disabled={historyCount === 0 || loading}
                title={
                  historyCount > 0 ? "Clear History" : "No history to clear"
                }
              >
                Clear History
              </button>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {route && (
            <div className={styles.routeResult}>
              <div className={styles.routeHeader}>
                <span>Your Route</span>
                <button className={styles.clearButton} onClick={clearRoute}>
                  ✕
                </button>
              </div>
              <div className={styles.routeDetails}>
                <div className={styles.routeInfo}>
                  <strong>Distance:</strong> {route.distance} units
                </div>
                <div className={styles.routeInfo}>
                  <strong>Path:</strong> {route.path.join(" → ")}
                </div>
                <div className={styles.routeInfo}>
                  <strong>Algorithm:</strong> {route.algorithm}
                </div>
              </div>
            </div>
          )}
          <div className={styles.recentSearches}>
            <h3 className={styles.recentTitle}>
              Recent Searches
              {historyCount > 0 && (
                <span className={styles.historyCount}>({historyCount})</span>
              )}
            </h3>
            <div className={styles.historyList}>
              {history.length > 0 ? (
                history
                  .slice(-3)
                  .reverse()
                  .map((item, index) => (
                    <div key={index} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <div className={styles.historyRoute}>
                          {item.start} → {item.destination}
                        </div>
                        <div className={styles.historyTime}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={styles.historyDetails}>
                        <span>Distance: {item.distance} units</span>
                        <span>Path: {item.path.join(" → ")}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className={styles.noHistory}>
                  No routes searched yet
                  <p>Your search history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.mapContainer}>
        <div className={styles.mapPlaceholder}>
          {selectedMapData ? (
            <MapVisualization
              route={route}
              locations={locations}
              selectedStart={startLocation}
              selectedEnd={endLocation}
              mapData={selectedMapData}
            />
          ) : loading ? (
            <div className={styles.emptyState}>
              <LoadingSpinner />
              <h3>Loading map...</h3>
              <p>Please wait while we load the map data.</p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🗺️</div>
              <h3>Select a Map to Get Started</h3>
              <p>Choose a map from the dropdown to visualize routes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
