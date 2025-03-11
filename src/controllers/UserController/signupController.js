import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../database/Usermodel/userModel.js';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

const signupController = async (req, res) => {
  const { email, username, firstName, lastName, phoneNumber, password, confirmPassword, age } = req.body;

  if (!email || !username || !firstName || !lastName || !phoneNumber || !password || !confirmPassword || !age) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (age < 18) {
    return res.status(400).json({ error: 'You must be at least 18 years old to register' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      age,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
      secretKey,
      { expiresIn: '1h' }
    );

    await sendEmail(
      newUser.email,
      '2FA Token',
      `Your 2FA token is: ${token}`
    );

    res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export { signupController };