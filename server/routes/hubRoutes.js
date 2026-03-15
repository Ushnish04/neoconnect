import express from 'express';
import { createHubContent, getHubContent, deleteHubContent } from '../controllers/hubController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getHubContent);
router.post('/', protect, allowRoles('secretariat', 'admin'), createHubContent);
router.delete('/:id', protect, allowRoles('secretariat', 'admin'), deleteHubContent);

export default router;