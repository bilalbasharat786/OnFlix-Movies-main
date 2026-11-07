// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Check karo ke kya Frontend ne header mein token bheja hai?
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token nikal lo (Bearer ke baad wala hissa)
      token = req.headers.authorization.split(' ')[1];

      // Token ko verify karo aur user ka ID nikalo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Database se user nikal kar aagay bhej do (password chupa kar)
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};