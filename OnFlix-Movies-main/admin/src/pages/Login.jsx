import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 🔥 YAHAN APNA SECRET EMAIL AUR PASSWORD LIKHO
    if (email === 'bilal@onflix.com' && password === 'bilal123') {
      // Agar theek hai, toh browser mein ek pass save kar do
      localStorage.setItem('onflix_admin_auth', 'true');
      navigate('/'); // Login hone ke baad home/dashboard par bhej do
    } else {
      alert('❌ Ghalat Email ya Password!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800 w-full max-w-md">
        <h2 className="text-3xl font-black text-red-600 mb-6 text-center">Admin Login</h2>
        
        <div className="mb-4">
          <label className="block text-gray-400 font-bold mb-2">Email</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded outline-none focus:border-red-600 border border-transparent transition-colors" 
            placeholder="admin@onflix.com"
          />
        </div>
        
        <div className="mb-8">
          <label className="block text-gray-400 font-bold mb-2">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white rounded outline-none focus:border-red-600 border border-transparent transition-colors" 
            placeholder="••••••••"
          />
        </div>
        
        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold text-lg transition-transform active:scale-95">
          Enter Admin Panel
        </button>
      </form>
    </div>
  );
}