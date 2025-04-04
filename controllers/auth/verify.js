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
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};