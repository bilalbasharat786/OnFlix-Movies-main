import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

// Helper function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. SIGNUP
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; 

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpire
    });

    const emailHTML = `
      <h2>Welcome to OnFlix Movies 🎬</h2>
      <p>Hi ${name}, your OTP for account verification is:</p>
      <h1 style="color: #dc2626; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your OnFlix Movies Account',
      html: emailHTML
    });

    res.status(201).json({ message: 'User registered. Please check your email for OTP.', email: user.email });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });
    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({
      message: 'Account verified successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email first via OTP' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 4. GOOGLE SIGN-IN / SIGN-UP
export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body; 
    let user = await User.findOne({ email });

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true 
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// controllers/authController.js ke aakhir mein add karein:

// 5. UPDATE PASSWORD
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Agar user Google se login hua tha, to uska password nahi hota
      if (user.googleId && !user.password) {
        return res.status(400).json({ message: "You logged in via Google. You cannot change password here." });
      }

      const { oldPassword, newPassword } = req.body;

      // Purana password check karo
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      // Naya password hash karo aur save karo
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 6. TOGGLE WISHLIST (Add / Remove)
export const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { mediaId, mediaType, title, posterUrl, rating, year } = req.body;

    // Check karo ke kya movie pehle se wishlist mein hai?
    const existingIndex = user.wishlist.findIndex(item => item.mediaId === mediaId);

    if (existingIndex !== -1) {
      // Agar pehle se hai, toh remove kar do (Unlike)
      user.wishlist.splice(existingIndex, 1);
      await user.save();
      return res.status(200).json({ message: 'Removed from Wishlist', wishlist: user.wishlist });
    } else {
      // Agar nahi hai, toh add kar do (Like)
      user.wishlist.push({ mediaId, mediaType, title, posterUrl, rating, year });
      await user.save();
      return res.status(200).json({ message: 'Added to Wishlist', wishlist: user.wishlist });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};