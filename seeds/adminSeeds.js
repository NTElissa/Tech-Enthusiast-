// seeds/adminSeeds.js

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';
import  connectDB  from '../config/db.js';

dotenv.config();

// Admin users to seed
const adminUsers = [
  {
    email: 'superadmin@example.com',
    username: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
    phoneNumber: '1234567890',
    password: 'SuperAdmin123!',
    age: 30,
    role: ROLES.SUPER_ADMIN,
    isVerified: true
  },
  {
    email: 'admin@example.com',
    username: 'admin',
    firstName: 'Regular',
    lastName: 'Admin',
    phoneNumber: '0987654321',
    password: 'Admin123!',
    age: 28,
    role: ROLES.ADMIN,
    isVerified: true
  }
];

// Function to seed admin users
const seedAdmins = async () => {
  try {
    await connectDB();
    
    console.log('Connected to database');
    
    // Clear existing admin users first (optional)
    console.log('Removing existing admin users...');
    await User.deleteMany({ 
      role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } 
    });
    
    // Hash passwords and create users
    const hashedAdmins = await Promise.all(adminUsers.map(async (admin) => {
      return {
        ...admin,
        password: await bcrypt.hash(admin.password, 10)
      };
    }));
    
    // Insert admin users
    console.log('Creating admin users...');
    await User.insertMany(hashedAdmins);
    
    console.log('Admin users seeded successfully!');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from database');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin users:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedAdmins();