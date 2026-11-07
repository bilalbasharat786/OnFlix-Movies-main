import express from 'express';
import { 
  registerUser, 
  verifyOTP, 
  loginUser, 
  googleAuth,
  updatePassword,
  toggleWishlist
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.put('/update-password', protect, updatePassword);
router.post('/wishlist', protect, toggleWishlist);

// 🔥 YEH HAI WO LINE JISKI WAJAH SE KOYEB CRASH HO RAHA THA
export default router;