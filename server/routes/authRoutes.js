import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  refresh,
  getUsers,
  updateUserRole,
  deleteUser
} from '../controllers/authController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refresh);
router.get('/users', protect, allowRoles('admin'), getUsers);
router.put('/users/:id/role', protect, allowRoles('admin'), updateUserRole);
router.delete('/users/:id', protect, allowRoles('admin'), deleteUser);

export default router;