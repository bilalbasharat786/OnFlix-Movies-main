import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { AuthContext } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useContext(AuthContext);
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔥 JADU: Jese hi Modal open ya close ho, purani yadasht (state) delete kar do!
  useEffect(() => {
    if (!isOpen) {
      setView('login'); // Wapis default login par le aao
      setFormData({ name: '', email: '', password: '', otp: '' }); // Form khali kar do
      setError(''); // Errors hta do
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      if (view === 'signup') {
        await axios.post(`${API_URL}/api/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setView('otp'); 
      } 
      else if (view === 'otp') {
        const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
          email: formData.email,
          otp: formData.otp
        });
        login(res.data); 
        onClose(); 
      } 
      else if (view === 'login') {
        const res = await axios.post(`${API_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        login(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const API_URL = import.meta.env.VITE_API_URL;
      
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub
      });

      login(res.data);
      onClose();
    } catch (err) {
      setError('Google Sign-In failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-[0_0_40px_rgba(220,38,38,0.15)] animate-[fadeIn_0.3s_ease-out]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Verify Email'}
        </h2>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {view === 'signup' && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" name="name" value={formData.name} placeholder="Full Name" required onChange={handleChange}
                className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-red-600 transition" />
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="email" name="email" value={formData.email} placeholder="Email Address" required onChange={handleChange}
                  className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-red-600 transition" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="password" name="password" value={formData.password} placeholder="Password" required onChange={handleChange}
                  className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-red-600 transition" />
              </div>
            </>
          )}

          {/* 🔥 NAYA OTP SECTION 🔥 */}
          {view === 'otp' && (
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Success Message */}
              <div className="w-full bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-lg text-sm font-medium">
                OTP sent successfully!
              </div>
              
              {/* Dynamic Email Text */}
              <p className="text-gray-300 text-sm">
                We have sent a 6-digit code to <br />
                <span className="font-bold text-white text-base">{formData.email}</span>
              </p>

              <div className="relative w-full mt-2">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                {/* Placeholder image ke mutabiq dash dash wala kar diya hai */}
                <input type="text" name="otp" value={formData.otp} placeholder="- - - - - -" required maxLength="6" onChange={handleChange}
                  className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-red-600 tracking-[0.5em] text-center text-xl transition placeholder:tracking-[0.5em]" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition mt-2 flex justify-center items-center h-12 ${
              view === 'otp' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (view === 'login' ? 'Sign In' : view === 'signup' ? 'Sign Up' : 'Verify & Create Account')}
          </button>

          {/* 🔥 BACK TO CHANGE EMAIL BUTTON 🔥 */}
          {view === 'otp' && (
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={() => { setView('signup'); setFormData({...formData, otp: ''}); }} 
                className="text-blue-400 hover:text-blue-300 hover:underline transition text-sm"
              >
                Back to change Email
              </button>
            </div>
          )}

        </form>

        {(view === 'login' || view === 'signup') && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign-In Failed')}
                theme="filled_black"
                shape="pill"
              />
            </div>
          </>
        )}

        {view !== 'otp' && (
          <p className="text-center text-gray-400 text-sm mt-4">
            {view === 'login' ? "New to On Flix Stream? " : "Already have an account? "}
            <button type="button" onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }} 
              className="text-white hover:text-red-500 font-bold transition">
              {view === 'login' ? 'Sign up now.' : 'Sign in.'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthModal;