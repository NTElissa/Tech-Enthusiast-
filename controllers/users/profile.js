// controllers/users/profile.js

import User from '../../models/User.js';
import { STATUS_CODES } from '../../config/constants.js';
import bcrypt from 'bcrypt';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -verificationToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'User not found' 
      });
    }
    
    res.status(STATUS_CODES.OK).json({ 
      user 
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  const { firstName, lastName, phoneNumber, bio, currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        error: 'User not found' 
      });
    }
    
    // Update basic info if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.bio = bio;
    
    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          error: 'Current password is incorrect' 
        });
      }
      
      // Hash and set new password
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    await user.save();
    
    res.status(STATUS_CODES.OK).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};