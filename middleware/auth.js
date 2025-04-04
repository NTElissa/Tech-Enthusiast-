// middleware/auth.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { STATUS_CODES } from '../config/constants.js';
import User from '../models/User.js';

dotenv.config();
const secretKey = process.env.JWT_SECRET;

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
        error: 'No token provided' 
      });
    }
    
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
        error: 'User not found' 
      });
    }
    
    req.user = {
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
        error: 'Token expired' 
      });
    }
    
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
      error: 'Invalid token' 
    });
  }
};

// Role-based authorization middleware
export const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
        error: 'User not authenticated' 
      });
    }
    
    if (req.user.role < requiredRole) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ 
        error: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};