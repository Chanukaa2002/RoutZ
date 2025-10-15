import { map as defaultMap } from "../utils/graphData.js";
import dijkstra from "../core/dijkstra.js";
import { saveSearchToHistory } from "./dsController.js";
import { db } from "../config/firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

// Find shortest path in a selected map (from DB or default)
export const findShortestPath = async (req, res) => {
  try {
    const { start, end, mapId } = req.body;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: "Start and end locations are required",
      });
    }

    let graph = defaultMap;
    if (mapId) {
      // Try to fetch map from Firestore
      const mapRef = doc(db, "maps", mapId);
      const mapSnap = await getDoc(mapRef);
      if (!mapSnap.exists()) {
        return res
          .status(404)
          .json({ success: false, error: `Map with id '${mapId}' not found` });
      }
      graph = mapSnap.data().graphData;
    }

    if (!graph[start]) {
      return res.status(400).json({
        success: false,
        error: `Start location '${start}' not found`,
      });
    }
    if (!graph[end]) {
      return res.status(400).json({
        success: false,
        error: `End location '${end}' not found`,
      });
    }

    const result = dijkstra(graph, start, end);

    if (result.error) {
      return res.status(404).json({
        success: false,
        error: result.error,
        message: "No path found between the specified locations",
      });
    } else {
      const searchData = {
        start: start,
        destination: end,
        path: result.path,
        distance: result.distance,
        visualizationData: {
          algorithm: "Dijkstra",
          nodesVisited: result.path.length,
        },
      };
      saveSearchToHistory(searchData);
      return res.status(200).json({
        success: true,
        message: "Shortest path found successfully",
        start: start,
        end: end,
        path: result.path,
        distance: result.distance,
        algorithm: "Dijkstra",
        savedToHistory: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
