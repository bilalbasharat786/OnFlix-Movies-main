import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Trash2 } from 'lucide-react';
import axios from 'axios';

const Wishlist = () => {
  const { user, updateWishlist } = useContext(AuthContext);
  const navigate = useNavigate();

  // Agar user login nahi hai, to Home par bhej do
  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) return null;

  const removeFromWishlist = async (mediaId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const body = { mediaId }; // sirf ID bhej kar remove karwa denge
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/wishlist`, body, config);
      updateWishlist(res.data.wishlist);
    } catch (error) {
      console.error("Error removing from wishlist", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
          <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            {user?.wishlist?.length || 0} Items
          </span>
        </div>

        {user?.wishlist?.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p>Add movies and series you want to watch later.</p>
            <Link to="/" className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {user.wishlist.map((item) => {
              const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-watch-online-free-hd';
              const watchLink = item.mediaType === 'series' ? `/watch-series/${item.mediaId}/${slug}` : `/watch/${item.mediaId}/${slug}`;

              return (
                <div key={item.mediaId} className="group relative shadow-lg flex flex-col bg-[#121212] rounded-lg overflow-hidden border border-white/5">
                  <div className="relative aspect-[2/3]">
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                    
                    {/* Hover Overlay for Play */}
                    <Link to={watchLink} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" fill="white" />
                      </div>
                    </Link>

                    {/* Delete Button */}
                    <button 
                      onClick={(e) => { e.preventDefault(); removeFromWishlist(item.mediaId); }}
                      className="absolute top-2 right-2 p-2 bg-black/80 hover:bg-red-600 rounded-full transition z-20"
                      title="Remove"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>

                    {item.mediaType === 'series' && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                        SERIES
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{item.year}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;