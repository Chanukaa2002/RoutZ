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

export default router;
