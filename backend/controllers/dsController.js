import { insertionSort } from "../core/insertionSort.js";
import { locations } from "../utils/graphData.js";

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

