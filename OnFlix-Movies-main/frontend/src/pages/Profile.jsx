import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' ya 'error'
  const [loading, setLoading] = useState(false);

  // Agar user login nahi hai to zabardasti Home par bhej do
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Request mein Token bhej kar verify karna
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const res = await axios.put(`${API_URL}/api/auth/update-password`, passwords, config);
      
      setMessage({ text: res.data.message, type: 'success' });
      setPasswords({ oldPassword: '', newPassword: '' }); // Form clear kar do
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Something went wrong', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Jab tak redirect ho raha hai, tab tak kuch show na ho

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 md:px-8 flex justify-center">
      <div className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl">
        
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Account Settings</h1>

        {/* User Info Section */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 text-white text-xl font-bold mb-1">
              <User size={20} className="text-red-500" /> {user.name}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Mail size={16} /> {user.email}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock size={20} className="text-red-500" /> Change Password
          </h2>

          {message.text && (
            <div className={`p-3 rounded-lg text-sm mb-6 text-center border ${message.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
            <input 
              type="password" 
              name="oldPassword" 
              value={passwords.oldPassword}
              onChange={handleChange}
              placeholder="Current Password" 
              required 
              className="w-full bg-black text-white border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-red-600 transition"
            />
            <input 
              type="password" 
              name="newPassword" 
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="New Password" 
              required 
              className="w-full bg-black text-white border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-red-600 transition"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
        >
          <LogOut size={20} /> Logout from ON Flix Movies
        </button>

      </div>
    </div>
  );
};

export default Profile;