import express from 'express';
import { verifyToken, checkRole } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';
import { 
  createPost, 
  getAllPosts, 
  getPostById, 
  updatePost, 
  deletePost, 
  likePost 
} from '../controllers/blog/posts.js';

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
router.get('/:postId', getPostById);

// Authenticated user routes
router.post('/like/:postId', verifyToken, likePost);

// Admin routes
router.post('/', verifyToken, checkRole(ROLES.ADMIN), createPost);
router.put('/:postId', verifyToken, checkRole(ROLES.ADMIN), updatePost);
router.delete('/:postId', verifyToken, checkRole(ROLES.ADMIN), deletePost);

export default router;