import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, PlusCircle, Film, Tv } from 'lucide-react'; // Tv icon add kiya hai
import { useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('onflix_admin_auth'); // Pass delete kar do
    navigate('/login'); // Wapis login par bhej do
  };
  
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md border-b border-gray-800 sticky top-0 z-[100]">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Admin Logo / Title */}
        <div className="text-xl md:text-2xl font-black text-red-600 tracking-wider">
          <Link to="/admin" onClick={closeMenu}>OnFlix Admin</Link>
        </div>

        {/* === DESKTOP NAVIGATION === */}
        <div className="hidden lg:flex gap-6 items-center font-semibold text-gray-300 text-sm xl:text-base">
          
          {/* Movies Links */}
          <Link to="/admin/add-movie" className="hover:text-red-500 flex items-center gap-1 transition duration-300">
            <PlusCircle size={18} /> Add Movie
          </Link>
          <Link to="/admin/manage-bollywood" className="hover:text-red-500 flex items-center gap-1 transition duration-300">
            <Film size={18} /> Bollywood
          </Link>
          <Link to="/admin/manage-hollywood" className="hover:text-red-500 flex items-center gap-1 transition duration-300">
            <Film size={18} /> Hollywood
          </Link>
          <Link to="/admin/manage-tollywood" className="hover:text-red-500 flex items-center gap-1 transition duration-300">
            <Film size={18} /> Tollywood
          </Link>

          <span className="text-gray-600">|</span> {/* Divider */}

          {/* Series Links 🔥 */}
          <Link to="/admin/add-series" className="hover:text-red-500 flex items-center gap-1 transition duration-300 text-yellow-500">
            <PlusCircle size={18} /> Add Series
          </Link>
          <Link to="/admin/manage-series" className="hover:text-red-500 flex items-center gap-1 transition duration-300">
            <Tv size={18} /> Web Series
          </Link>
          <Link to="/admin/manage-kdrama" className="hover:text-red-500 flex items-center gap-1 transition duration-300">
            <Tv size={18} /> K-Drama
          </Link>
          <Link to="/admin/manage-anime" className="hover:text-red-500 flex items-center gap-1 transition duration-300">
            <Tv size={18} /> Anime
          </Link>

          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md font-bold text-sm ml-4 transition">
            Logout
          </button>
        </div>

        {/* === MOBILE MENU BUTTON === */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-gray-300 hover:text-white focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* === MOBILE DROPDOWN MENU === */}
      <div className={`lg:hidden overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[80vh] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
          
          <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Movies Section</h4>
          <Link to="/admin/add-movie" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2 border-b border-gray-700">
            <PlusCircle size={20} className="text-red-600" /> Add New Movie
          </Link>
          <Link to="/admin/manage-bollywood" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2 border-b border-gray-700">
            <Film size={20} className="text-red-600" /> Manage Bollywood
          </Link>
          <Link to="/admin/manage-hollywood" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2 border-b border-gray-700">
            <Film size={20} className="text-red-600" /> Manage Hollywood
          </Link>
           <Link to="/admin/manage-tollywood" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2 border-b border-gray-700">
            <Film size={20} className="text-red-600" /> Manage Tollywood
          </Link>

          <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2">Series Section</h4>
          <Link to="/admin/add-series" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2 border-b border-gray-700 text-yellow-500">
            <PlusCircle size={20} className="text-yellow-500" /> Add New Series
          </Link>
          <Link to="/admin/manage-series" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2 border-b border-gray-700">
            <Tv size={20} className="text-blue-500" /> Manage Web Series
          </Link>
          <Link to="/admin/manage-kdrama" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2 border-b border-gray-700">
            <Tv size={20} className="text-blue-500" /> Manage K-Drama
          </Link>
          <Link to="/admin/manage-anime" onClick={closeMenu} className="hover:text-red-500 font-bold flex items-center gap-3 py-2">
            <Tv size={20} className="text-blue-500" /> Manage Anime
          </Link>

          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 mt-4 rounded-md font-bold text-sm w-full transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}