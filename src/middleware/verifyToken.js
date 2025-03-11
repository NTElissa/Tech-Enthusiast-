import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.JWT_SECRET;


export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey); 
    req.user = decoded; 
    next(); 
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};