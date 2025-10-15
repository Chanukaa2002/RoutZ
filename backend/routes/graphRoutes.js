import { Router } from "express";
import { findShortestPath } from "../controllers/graphController.js";
import { addMap, deleteMap } from "../controllers/mapController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/shortest-path", findShortestPath);

// Map management (protected)
router.post("/add-map", authenticate, addMap);
router.delete("/delete-map/:id", authenticate, deleteMap);

export default router;
