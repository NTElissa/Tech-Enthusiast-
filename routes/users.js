// routes/users.js

import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';
import { getProfile, updateProfile } from '../controllers/users/profile.js';
import { getAllUsers, deleteUser, updateUserRole } from '../controllers/users/admin.js';

const router = express.Router();

// User routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Admin routes
router.get('/all', verifyToken, checkRole(ROLES.ADMIN), getAllUsers);
router.delete('/:userId', verifyToken, checkRole(ROLES.ADMIN), deleteUser);

// Super Admin routes
router.put('/:userId/role', verifyToken, checkRole(ROLES.SUPER_ADMIN), updateUserRole);

export default router;