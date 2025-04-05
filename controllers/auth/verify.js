// controllers/auth/verify.js

import User from '../../models/User.js';
import { STATUS_CODES } from '../../config/constants.js';

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'Verification token is required' 
    });
  }
  
  try {
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        error: 'Invalid verification token' 
      });
    }
    
    // Mark user as verified and remove token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.status(STATUS_CODES.OK).json({ 
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error during verification' 
    });
  }
};

// Add a bypass verification method for development
export const bypassVerification = async (req, res) => {
  // Only enable this in development environment
  if (process.env.NODE_ENV !== 'development') {
    return res.status(STATUS_CODES.FORBIDDEN).json({
      error: 'This endpoint is only available in development mode'
    });
  }
  
  const { token } = req.body;
  
  if (!token) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'Verification token is required' 
    });
  }
  
  try {
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        error: 'Invalid verification token' 
      });
    }
    
    // Mark user as verified and remove token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.status(STATUS_CODES.OK).json({ 
      message: 'Email verification bypassed successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};