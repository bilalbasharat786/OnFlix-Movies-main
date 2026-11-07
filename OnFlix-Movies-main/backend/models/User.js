import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String,
    required: false 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  otp: { 
    type: String 
  },
  otpExpire: { 
    type: Date 
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    default: 'user'
  },
  wishlist: [{
    mediaId: { type: String, required: true },
    mediaType: { type: String, required: true }, // 'movie' ya 'series'
    title: { type: String, required: true },
    posterUrl: { type: String },
    rating: { type: String },
    year: { type: String }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;