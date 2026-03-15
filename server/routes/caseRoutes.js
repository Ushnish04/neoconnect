import express from 'express';
import { submitCase, getCases, getCase, assignCase, updateStatus, addNote, getMyCases, getAssignedCases } from '../controllers/caseController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/submit', protect, upload.array('attachments', 5), submitCase);
router.get('/', protect, allowRoles('secretariat', 'admin'), getCases);
router.get('/my', protect, getMyCases);
router.get('/assigned', protect, allowRoles('case_manager'), getAssignedCases);
router.get('/:id', protect, getCase);
router.put('/assign', protect, allowRoles('secretariat'), assignCase);
router.put('/:id/status', protect, allowRoles('case_manager', 'secretariat'), updateStatus);
router.post('/:id/note', protect, allowRoles('case_manager', 'secretariat'), addNote);

export default router;