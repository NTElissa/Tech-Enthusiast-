// utils/email.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Add this to avoid connection issues
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured properly');
      return { success: false, message: 'Email configuration missing' };
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
      html: html || undefined
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendVerificationEmail = async (user, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email</h2>
      <p>Hello ${user.firstName},</p>
      <p>Thank you for registering. Please verify your email by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </div>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Blog Team</p>
    </div>
  `;
  
  return sendEmail(
    user.email,
    'Verify Your Email Address',
    `Please verify your email by clicking on the following link: ${verificationLink}`,
    html
  );
};