// controllers/auth/login.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../../models/User.js';
import { STATUS_CODES, AUTH } from '../../config/constants.js';

dotenv.config();
const secretKey = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'Email and password are required' 
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
        error: 'Please verify your email before logging in' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      secretKey,
      { expiresIn: AUTH.TOKEN_EXPIRY }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      secretKey,
      { expiresIn: AUTH.REFRESH_TOKEN_EXPIRY }
    );

    res.status(STATUS_CODES.OK).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};