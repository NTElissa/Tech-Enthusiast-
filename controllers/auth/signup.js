// controllers/auth/signup.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../../models/User.js';
import { ROLES, STATUS_CODES } from '../../config/constants.js';
import { sendEmail } from '../../utils/email.js';

dotenv.config();
const secretKey = process.env.JWT_SECRET;

export const signup = async (req, res) => {
  const { 
    email, 
    username, 
    firstName, 
    lastName, 
    phoneNumber, 
    password, 
    confirmPassword, 
    age, 
    role 
  } = req.body;

  // Input validation
  if (!email || !username || !firstName || !lastName || !phoneNumber || !password || !confirmPassword || !age) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'All fields are required' 
    });
  }

  if (age < 18) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'You must be at least 18 years old to register' 
    });
  }

  if (password !== confirmPassword) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ 
      error: 'Passwords do not match' 
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        error: 'Email or username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create new user
    const newUser = new User({
      email,
      username,
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      age,
      role: role || ROLES.USER,
      verificationToken
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      secretKey,
      { expiresIn: '1h' }
    );

    // Try to send verification email but don't fail registration if email fails
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    try {
      const emailResult = await sendEmail(
        newUser.email,
        'Email Verification',
        `Please verify your email by clicking on the following link: ${verificationLink}`
      );
      
      if (!emailResult.success) {
        console.warn('Failed to send verification email, but user was created:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // We continue registration process even if email fails
    }

    res.status(STATUS_CODES.CREATED).json({ 
      message: 'User created successfully. If configured, a verification email has been sent.',
      verificationRequired: true,
      verificationToken, // Only include this in development environment
      token 
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ 
      error: 'Server error' 
    });
  }
};