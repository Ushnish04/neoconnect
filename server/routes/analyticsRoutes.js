import express from 'express';
import { getCasesByDepartment, getCasesByStatus, getCasesByCategory, getHotspots } from '../controllers/analyticsController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/by-department', protect, allowRoles('secretariat', 'admin'), getCasesByDepartment);
router.get('/by-status', protect, allowRoles('secretariat', 'admin'), getCasesByStatus);
router.get('/by-category', protect, allowRoles('secretariat', 'admin'), getCasesByCategory);
router.get('/hotspots', protect, allowRoles('secretariat', 'admin'), getHotspots);

export default router;