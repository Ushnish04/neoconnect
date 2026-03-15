import express from 'express';
import { createPoll, getPolls, vote } from '../controllers/pollController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, allowRoles('secretariat', 'admin'), createPoll);
router.get('/', protect, getPolls);
router.post('/:id/vote', protect, vote);

export default router;