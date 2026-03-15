import express from 'express';
import { summarizeCase, getTrendInsight, suggestTag } from '../controllers/aiController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summarize/:id', protect, allowRoles('case_manager', 'secretariat', 'admin'), summarizeCase);
router.post('/insight', protect, allowRoles('secretariat', 'admin'), getTrendInsight);
router.post('/suggest', protect, suggestTag);

export default router;