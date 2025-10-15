import { Router } from "express";
import { findShortestPath } from "../controllers/graphController.js";
import {
  addMap,
  deleteMap,
  getAllMaps,
  getMapById,
} from "../controllers/mapController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/shortest-path", findShortestPath);

// Get all maps (public)
router.get("/maps", getAllMaps);

// Get specific map by ID (public)
router.get("/maps/:id", getMapById);

// Map management (protected)
router.post("/add-map", authenticate, addMap);
router.delete("/delete-map/:id", authenticate, deleteMap);

export default router;
