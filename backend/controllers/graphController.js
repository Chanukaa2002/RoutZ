import { map } from "../utils/graphData.js";
import dijkstra from "../core/dijkstra.js";
import { saveSearchToHistory } from "./dsController.js";

export const findShortestPath = (req, res) => {
  try {
    const { start, end } = req.body;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: "Start and end locations are required",
      });
    }

    if (!map[start]) {
      return res.status(400).json({
        success: false,
        error: `Start location '${start}' not found`,
      });
    }

    if (!map[end]) {
      return res.status(400).json({
        success: false,
        error: `End location '${end}' not found`,
      });
    }

    const result = dijkstra(map, start, end);

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
