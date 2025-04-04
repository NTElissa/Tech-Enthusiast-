// models/User.js

import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  role: {
    type: Number,
    default: ROLES.USER,
    enum: Object.values(ROLES)
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  profilePicture: String,
  bio: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN;
};

// Method to check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === ROLES.SUPER_ADMIN;
};

const User = mongoose.model('User', userSchema);

export default User;