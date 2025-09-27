import { Router } from "express";
import {
  listSorting,
  findPathWithHistory,
  undoLastSearch,
  canUndo,
  clearSearchHistory,
  getSearchHistory,
} from "../controllers/dsController.js";

const router = Router();

router.get("/sort-locations", listSorting);
router.get("/search-history", getSearchHistory);
router.post("/find-path-with-history", findPathWithHistory);
router.post("/undo", undoLastSearch);
router.get("/can-undo", canUndo);
router.delete("/clear-history", clearSearchHistory);

export default router;
