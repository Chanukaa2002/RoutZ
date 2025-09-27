import { Router} from 'express';
import {findShortestPath}  from '../controllers/graphController.js'

const router = Router()

router.post('/shortest-path', findShortestPath);

export default router;
