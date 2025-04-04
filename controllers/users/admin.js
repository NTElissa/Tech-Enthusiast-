// controllers/users/admin.js

import User from '../../models/User.js';
import { STATUS_CODES, ROLES } from '../../config/constants.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -verificationToken -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 });
    
    res.status(STATUS_CODES.OK).json({ 
      users 
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'User not found' 
      });
    }
    
    // Prevent deleting super admin accounts
    if (user.role === ROLES.SUPER_ADMIN) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ 
        error: 'Cannot delete super admin accounts' 
      });
    }
    
    // Regular admins can only delete regular users
    if (req.user.role === ROLES.ADMIN && user.role === ROLES.ADMIN) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ 
        error: 'Admin cannot delete other admin accounts' 
      });
    }
    
    await user.deleteOne();
    
    res.status(STATUS_CODES.OK).json({ 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Update user role (super admin only)
export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  if (role === undefined || !Object.values(ROLES).includes(role)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'Invalid role provided' 
    });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'User not found' 
      });
    }
    
    // Prevent changing own role
    if (user._id.toString() === req.user.userId) {
      return res.status(STATUS_CODES.FORBIDDEN).json({ 
        error: 'Cannot change your own role' 
      });
    }
    
    user.role = role;
    await user.save();
    
    res.status(STATUS_CODES.OK).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};