import { db } from "../config/firebaseConfig.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";

// Add a new map (graph) - only for authenticated admins
export const addMap = async (req, res) => {
  const { mapId, mapName, graphData } = req.body;
  const adminUid = req.user && req.user.uid;

  if (!adminUid) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!mapId || !mapName || !graphData) {
    return res.status(400).json({
      success: false,
      message: "mapId, mapName, and graphData are required",
    });
  }

  try {
    const mapRef = doc(db, "maps", mapId);
    await setDoc(mapRef, {
      mapId,
      mapName,
      graphData,
      ownerUid: adminUid,
      createdAt: new Date().toISOString(),
    });
    return res
      .status(201)
      .json({ success: true, message: "Map created successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create map",
      error: error.message,
    });
  }
};

// Delete a map (only if the admin is the owner)
export const deleteMap = async (req, res) => {
  const { id } = req.params;
  const adminUid = req.user && req.user.uid;

  if (!adminUid) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Map id is required" });
  }

  try {
    const mapRef = doc(db, "maps", id);
    const mapSnap = await getDoc(mapRef);
    if (!mapSnap.exists()) {
      return res.status(404).json({ success: false, message: "Map not found" });
    }
    const mapData = mapSnap.data();
    if (mapData.ownerUid !== adminUid) {
      return res
        .status(403)
        .json({ success: false, message: "You can only delete your own maps" });
    }
    await deleteDoc(mapRef);
    return res
      .status(200)
      .json({ success: true, message: "Map deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete map",
      error: error.message,
    });
  }
};

// Get all available maps (public - no authentication required)
export const getAllMaps = async (req, res) => {
  try {
    const mapsRef = collection(db, "maps");
    const snapshot = await getDocs(mapsRef);
    const maps = [];
    snapshot.forEach((doc) => {
      maps.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return res.status(200).json({ success: true, maps });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch maps",
      error: error.message,
    });
  }
};

// Get a specific map by ID (public - no authentication required)
export const getMapById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Map ID is required",
    });
  }

  try {
    const mapRef = doc(db, "maps", id);
    const mapSnap = await getDoc(mapRef);

    if (!mapSnap.exists()) {
      return res.status(404).json({
        success: false,
        message: "Map not found",
      });
    }

    const mapData = mapSnap.data();
    return res.status(200).json({
      success: true,
      map: {
        id: mapSnap.id,
        ...mapData,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch map",
      error: error.message,
    });
  }
};
