import { insertionSort } from "../core/insertionSort.js";
import { locations } from "../utils/graphData.js";
import Stack from "../utils/dataStructures/Stack.js";

const searchHistoryStack = new Stack();

export const listSorting = (req, res) => {
  try {
    const locationsToSort = [...locations];
    const sortedLocations = insertionSort(locationsToSort);

    res.status(200).json({
      success: true,
      message: "Locations sorted successfully using insertion sort",
      originalLocations: locations,
      sortedLocations: sortedLocations,
      totalLocations: sortedLocations.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sorting locations",
      error: error.message,
    });
  }
};

export const saveSearchToHistory = (searchData) => {
  try {
    const searchEntry = {
      start: searchData.start,
      destination: searchData.destination,
      path: searchData.path,
      distance: searchData.distance,
      timestamp: new Date().toISOString(),
      visualizationData: searchData.visualizationData,
    };

    searchHistoryStack.push(searchEntry);
    return true;
  } catch (error) {
    console.error("Error saving search to history:", error);
    return false;
  }
};

export const findPathWithHistory = (req, res) => {
  try {
    const { start, destination, currentPath, distance, visualizationData } =
      req.body;

    // Validate input
    if (!start || !destination) {
      return res.status(400).json({
        success: false,
        message: "Start and destination locations are required",
      });
    }

    if (!locations.includes(start) || !locations.includes(destination)) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or destination location",
      });
    }

    if (currentPath && distance !== undefined) {
      const saved = saveSearchToHistory({
        start,
        destination,
        path: currentPath,
        distance,
        visualizationData: visualizationData || {},
      });

      if (!saved) {
        return res.status(500).json({
          success: false,
          message: "Failed to save current search to history",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Search saved to history successfully",
      canUndo: !searchHistoryStack.isEmpty(),
      historyCount: getStackSize(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing search with history",
      error: error.message,
    });
  }
};

export const undoLastSearch = (req, res) => {
  try {
    if (searchHistoryStack.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "No previous search to undo - history is empty",
      });
    }

    const previousSearch = searchHistoryStack.pop();

    res.status(200).json({
      success: true,
      message: "Successfully undone to previous search",
      previousSearch: previousSearch,
      canUndo: !searchHistoryStack.isEmpty(),
      historyCount: getStackSize(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error undoing search",
      error: error.message,
    });
  }
};

export const canUndo = (req, res) => {
  try {
    const canUndoAction = !searchHistoryStack.isEmpty();
    const historyCount = getStackSize();

    res.status(200).json({
      success: true,
      canUndo: canUndoAction,
      historyCount: historyCount,
      message: canUndoAction
        ? `${historyCount} previous search(es) available for undo`
        : "No previous searches available for undo",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking undo availability",
      error: error.message,
    });
  }
};

export const clearSearchHistory = (req, res) => {
  try {
    while (!searchHistoryStack.isEmpty()) {
      searchHistoryStack.pop();
    }

    res.status(200).json({
      success: true,
      message: "Search history cleared successfully",
      canUndo: false,
      historyCount: 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing search history",
      error: error.message,
    });
  }
};

export const getSearchHistory = (req, res) => {
  try {
    const historyList = [];
    const tempStack = new Stack();

    while (!searchHistoryStack.isEmpty()) {
      const item = searchHistoryStack.pop();
      historyList.unshift(item);
      tempStack.push(item);
    }

    while (!tempStack.isEmpty()) {
      searchHistoryStack.push(tempStack.pop());
    }

    res.status(200).json({
      success: true,
      message: "Search history retrieved successfully",
      history: historyList,
      totalSearches: historyList.length,
      canUndo: !searchHistoryStack.isEmpty(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving search history",
      error: error.message,
    });
  }
};

const getStackSize = () => {
  let count = 0;
  const tempStack = new Stack();

  while (!searchHistoryStack.isEmpty()) {
    tempStack.push(searchHistoryStack.pop());
    count++;
  }

  while (!tempStack.isEmpty()) {
    searchHistoryStack.push(tempStack.pop());
  }

  return count;
};
  

