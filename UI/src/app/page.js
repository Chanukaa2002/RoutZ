"use client";
import { useState, useEffect } from "react";
import styles from "./page_new.module.css";
import LoadingSpinner from "./components/LoadingSpinner";
import Demo from "./components/Demo";
import MapVisualization from "./components/MapVisualization";
import Image from "next/image";

// const API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "https://rout-z-bjil.vercel.app/api";

export default function Home() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [route, setRoute] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  // Fetch available locations on component mount
  useEffect(() => {
    fetchLocations();
    fetchHistory();
    checkUndoStatus();
  }, []);

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

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/graph/shortest-path`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: startLocation,
          end: endLocation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRoute(data);
        fetchHistory(); // Refresh history after successful search
        checkUndoStatus(); // Update undo status
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
        // Restore the previous search
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
              <Image
                src="/nav.gif" // file stored in public/clock.svg
                alt="RoutZ Icon"
                width={45}
                height={45}
              />
            </span>
            <span className={styles.logoText}>RoutZ</span>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>Find your Location</h2>

          <Demo onDemoSelect={handleDemoSelect} />

          {(startLocation || endLocation) && (
            <div className={styles.selectionPreview}>
              <div className={styles.previewHeader}>
                <span>Current Selection</span>
              </div>
              <div className={styles.previewContent}>
                {startLocation && (
                  <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>From:</span>
                    <span className={styles.previewValue}>{startLocation}</span>
                  </div>
                )}
                {endLocation && (
                  <div className={styles.previewItem}>
                    <span className={styles.previewLabel}>To:</span>
                    <span className={styles.previewValue}>{endLocation}</span>
                  </div>
                )}
                {startLocation &&
                  endLocation &&
                  startLocation !== endLocation && (
                    <div className={styles.previewStatus}>
                      Ready to find path! 
                    </div>
                  )}
              </div>
            </div>
          )}

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

          {/* History & Controls */}
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
          {route || locations.length > 0 ? (
            <MapVisualization
              route={route}
              locations={locations}
              selectedStart={startLocation}
              selectedEnd={endLocation}
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🗺️</div>
              <h3>Loading campus map...</h3>
              <p>Please wait while we load the location data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
