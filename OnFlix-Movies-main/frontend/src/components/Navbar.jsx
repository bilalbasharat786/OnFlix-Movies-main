import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, Menu, X, Star } from 'lucide-react'; // 🔥 Send hata diya kyunke ab UI change hai
import { AuthContext } from '../context/AuthContext'; 
import AuthModel from './AuthModel'; 
import axios from 'axios'; 
import { toast } from 'react-toastify'; 

const Navbar = () => {
  const { user, logout } = useContext(AuthContext); 
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // 🔥 STATES: Movie Request Pop-up ke liye
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [movieName, setMovieName] = useState('');
  const [loadingRequest, setLoadingRequest] = useState(false);
  
  // URL se search word nikalne ke liye
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const searchQuery = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Agar URL bahar se change ho (jaise back button), to input box ko update rakhega
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // === 🔥 MAGIC: Super Fast Global Search Logic ===
  const handleSearch = (e) => {
    const query = e.target.value;
    
    setLocalSearch(query); 

    if (query) {
      navigate(`/?q=${query}`); 
    } else {
      if (location.pathname === '/') {
        navigate('/'); 
      } else {
        navigate(location.pathname); 
      }
    }
  };

  // === 🌟 FUNCTION: Brevo/Gmail ko email bhejne wala ===
  const handleMovieRequest = async () => {
    console.log("▶️ Send Button Clicked!");
    console.log("📝 Movie Name in state:", movieName);
    
    if (!movieName.trim()) {
      console.log("⚠️ Warning: Name empty tha. Rok diya.");
      toast.warning("Pehle movie ka naam to likhein! ⚠️");
      return;
    }

    setLoadingRequest(true);
    console.log("⏳ Sending request to Backend...");
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/requests/movie`;
      const response = await axios.post(url, { movieName });
      
      console.log("🌐 Hitting URL:", url);
      console.log("✅ Backend se Jawab aaya:", response.data);
      
      toast.success("Farmaish pohanch gayi! Jaldi upload ho jayegi 🚀");
      setMovieName('');
      setIsRequestOpen(false); // Pop-up band kar do
    } catch (error) {
      console.error("❌ Frontend Catch Error:", error);
      if(error.response) {
          console.error("📄 Error Response Data:", error.response.data);
      }
      toast.error("Masla aa gaya, dobara try karein ❌");
    } finally {
      console.log("⏹️ Loading state khatam (false).");
      setLoadingRequest(false);
    }
  };

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 relative">
            
            {/* 1. Logo & Movie Request Star 🔥 */}
            <div className="flex-shrink-0 flex items-center gap-2 md:gap-4">
              <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
                <img 
                  src="/vite.svg" 
                  alt="On Flix Stream Logo" 
                  className="h-8 md:h-10 w-auto object-contain" 
                />
              </Link>

              {/* 🌟 Star Button (Sirf Pop-up open karega) */}
              <button 
                onClick={() => setIsRequestOpen(true)} 
                className="relative group p-1 flex items-center justify-center transition-transform hover:scale-110"
                title="Movie Request Karein"
              >
                <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse fill-yellow-400/20 group-hover:fill-yellow-400 transition-all" />
              </button>
            </div>

            {/* 2. Desktop Menu */}
            <div className="hidden lg:flex space-x-6 items-center flex-1 justify-center">
              <Link to="/hollywood" className="text-gray-300 hover:text-white transition font-medium whitespace-nowrap">
                Hollywood
              </Link>
              <Link to="/bollywood" className="text-gray-300 hover:text-white transition font-medium whitespace-nowrap">
                Bollywood
              </Link>
              <Link to="/tollywood" className="text-gray-300 hover:text-white transition font-medium whitespace-nowrap">
                South Indian
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/web-series" className="text-red-500 hover:text-red-400 font-bold transition whitespace-nowrap">
                Web Series
              </Link>
            </div>

            {/* 3. Search Bar & Auth System */}
            <div className="flex items-center gap-2 md:gap-4 flex-1 lg:flex-none justify-end">
              
              <div className="w-full max-w-xs md:max-w-sm relative">
                <input 
                  type="text" 
                  placeholder="Search..."
                  value={localSearch}
                  onChange={handleSearch}
                  className="w-full py-1.5 md:py-2 pl-3 md:pl-4 pr-8 md:pr-10 text-white bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all text-xs md:text-sm"
                />
                <Search className="absolute right-2.5 top-2 md:top-2.5 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              </div>

              {/* 🔥 LOGIN / USER PROFILE BUTTONS 🔥 (Aap ki exact logic) */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {user ? (
                  <>
                    <Link 
                      to="/wishlist" 
                      className="hidden sm:block text-white text-xs md:text-sm font-bold border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-white/10 transition whitespace-nowrap"
                    >
                      My List
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="w-8 h-8 md:w-9 md:h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold hover:bg-red-700 transition shadow-lg" 
                      title="View Profile"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Link>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-transparent hover:bg-white/10 border border-white/20 text-white text-xs md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full transition whitespace-nowrap"
                  >
                    Sign In
                  </button>
                )}
              </div>

            </div>

            {/* 4. Mobile Menu Button */}
            <div className="lg:hidden flex items-center flex-shrink-0">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white focus:outline-none p-1 ml-1"
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>

          </div>
        </div>

        {/* === MOBILE MENU === (Aap ki exact logic) */}
        {isOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-800 px-4 pt-2 pb-4 shadow-lg absolute w-full left-0 z-50">
            <div className="flex flex-col space-y-3 mt-2">
              <Link to="/hollywood" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium block py-2 border-b border-gray-800">
                Hollywood (Hindi Dubbed)
              </Link>
              <Link to="/bollywood" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium block py-2 border-b border-gray-800">
                Bollywood
              </Link>
              <Link to="/tollywood" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium block py-2 border-b border-gray-800">
                South Indian
              </Link>
              <Link to="/web-series" onClick={() => setIsOpen(false)} className="text-red-500 font-bold block py-2 border-b border-gray-800">
                Web Series (All Seasons)
              </Link>
              
              {user && (
                <Link to="/wishlist" onClick={() => setIsOpen(false)} className="text-white font-bold block py-2">
                  My List (Wishlist)
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================== */}
      {/* 🌟 NAYA JADU: BEAUTIFUL NETFLIX-STYLE MOVIE REQUEST MODAL 🌟 */}
      {/* ============================================================== */}
      {isRequestOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Blur Overlay */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsRequestOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-[#141414] border border-gray-800 rounded-2xl shadow-[0_0_50px_-12px_rgba(220,38,38,0.25)] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsRequestOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 text-center">
              Movie Request
            </h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Apni pasand ki movie ki farmaish karein, hum jald upload karenge.
            </p>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleMovieRequest(); }}>
              <div className="mb-6">
                <input 
                  type="text" 
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  placeholder="Movie ka poora naam likhein..." 
                  className="w-full bg-[#333333] text-white px-4 py-3 sm:py-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder-gray-400"
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                disabled={loadingRequest}
                className={`w-full font-bold text-white py-3 sm:py-4 rounded-md transition-all flex justify-center items-center ${
                  loadingRequest 
                  ? 'bg-red-800 cursor-not-allowed animate-pulse' 
                  : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30'
                }`}
              >
                {loadingRequest ? 'Farmaish Bheji Jaa Rahi Hai...' : 'Submit Request'}
              </button>
            </form>
            
          </div>
        </div>
      )}

      {/* Auth Modal hamesha Navbar se bahar call hoga */}
      <AuthModel isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;