import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Info, ChevronLeft, ChevronRight, ExternalLink, Star, X } from 'lucide-react'; // 🔥 X icon add kiya hai

const Hero = () => {
  const [heroMovies, setHeroMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Swipe ke liye Touch states
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 🔥 NAYA: Welcome Popup State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  
  const navigate = useNavigate();

  // === 🔥 NAYA: First Time Visitor Popup Logic ===
  useEffect(() => {
    // Check karo ke kya user pehle aa chuka hai?
    const hasSeenPopup = localStorage.getItem('onflix_welcome_shown');
    
    if (!hasSeenPopup) {
      // Agar naya user hai to popup dikhao
      setShowWelcomePopup(true);
      // Browser ko bata do ke ab isne dekh liya hai
      localStorage.setItem('onflix_welcome_shown', 'true');

      // Theek 6 second (6000ms) baad popup band kar do
      const timer = setTimeout(() => {
        setShowWelcomePopup(false);
      }, 6000);

      // Cleanup
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchHeroMovies = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies/hero`);
        setHeroMovies(res.data);
      } catch (error) {
        console.error("Hero movies fetch karne mein masla:", error);
      }
    };
    fetchHeroMovies();
  }, []);

  // 3 Seconds wala Auto-Slider
  useEffect(() => {
    if (heroMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroMovies.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroMovies.length, currentIndex]); 

  // Manual Slide Functions
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroMovies.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? heroMovies.length - 1 : prevIndex - 1));
  };

  // Touch (Swipe) Handlers Mobile ke liye
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (heroMovies.length === 0) return null;

  const movie = heroMovies[currentIndex];
  
  // 🔥 BUG FIX: movie aur title ka safe check
  const baseSlug = movie?.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
  const slug = baseSlug ? `${baseSlug}-watch-online-free-hd` : '';
  
  return (
    <>
      <div 
        className="relative w-full h-[60vh] md:h-[80vh] bg-black overflow-hidden flex-shrink-0 flex items-center justify-center group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* 🔥 PREMIUM UI FIX: Background Blur Effect (Black bars hatane ke liye) */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={movie?.posterUrl}
            alt="blur-background"
            className="w-full h-full object-cover blur-3xl opacity-30 transform scale-110"
          />
        </div>

        {/* === ACTUAL POSTER (Object Contain) === */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            key={movie?._id}
            src={movie?.posterUrl} 
            alt={movie?.title}
            className="w-full h-full object-contain transition-opacity duration-1000 ease-in-out relative z-10"
          />
        </div>

        {/* LEFT & RIGHT ARROWS (Desktop & Tablet) */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-red-600 text-white p-2 md:p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:block shadow-lg"
        >
          <ChevronLeft size={28} />
        </button>

        <button 
          onClick={nextSlide}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-red-600 text-white p-2 md:p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:block shadow-lg"
        >
          <ChevronRight size={28} />
        </button>

        {/* === HERO CONTENT === */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-14 sm:px-8 md:pb-20 lg:px-16 z-20 pointer-events-none">
          
          {/* Dark Gradient Overlay neechay se taake text saaf nazar aaye */}
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent -z-10"></div>

          <div className="pointer-events-auto">
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 font-extrabold tracking-widest text-[10px] md:text-sm drop-shadow-md">
                    N E W
                  </span>
                  <span className="bg-gray-800/80 text-gray-200 text-[8px] md:text-xs px-2 py-0.5 rounded border border-gray-600 uppercase">
                    {movie?.category || 'Featured'}
                  </span>
              </div>

              {/* Movie Title */}
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] max-w-4xl transition-all duration-500 line-clamp-2">
                {movie?.title}
              </h1>

              {/* Movie Description */}
              <p className="text-gray-300 text-[10px] sm:text-xs md:text-lg max-w-xl mb-6 line-clamp-2 drop-shadow-[0_2px_5px_rgba(0,0,0,1)] font-medium">
                {movie?.description || "Watch this blockbuster movie right now in HD quality."}
              </p>

              {/* Buttons Container */}
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2">
                <button
                  onClick={() => navigate(`/play/${movie?._id}/${slug}`)}
                  className="flex items-center justify-center gap-1 md:gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 md:px-8 md:py-3 rounded-md font-bold text-xs md:text-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  <Play size={16} className="md:w-5 md:h-5 fill-white" /> Play
                </button>

                <button
                  onClick={() => navigate(`/watch/${movie?._id}/${slug}`)}
                  className="flex items-center justify-center gap-1 md:gap-2 bg-gray-500/30 hover:bg-gray-500/50 text-white px-5 py-2 md:px-8 md:py-3 rounded-md font-bold text-xs md:text-lg transition-all backdrop-blur-md border border-white/20"
                >
                  <Info size={16} className="md:w-5 md:h-5" /> Details
                </button>
              </div>
          </div>
        </div>

        {/* === SLIDER DOTS === */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
          {heroMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)} 
              className={`h-1.5 md:h-2 rounded-full transition-all duration-500 cursor-pointer shadow-md ${
                index === currentIndex ? 'w-6 md:w-10 bg-red-600' : 'w-2 md:w-3 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🌟 NAYA JADU: FIRST TIME VISITOR WELCOME POPUP 🌟 */}
      {/* ========================================================= */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          
          {/* Blur Background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          {/* Popup Content */}
          <div className="relative bg-[#141414] border border-yellow-500/30 rounded-2xl shadow-[0_0_40px_-10px_rgba(234,179,8,0.4)] p-6 md:p-8 max-w-sm w-full text-center animate-in zoom-in-95 fade-in duration-300">
            
            {/* 🔥 CLOSE (X) BUTTON 🔥 */}
            <button 
              onClick={() => setShowWelcomePopup(false)}
              className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>

            {/* Glowing Star Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Star className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse fill-yellow-400/20" />
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white mb-3">
              Farmaish Karein!
            </h2>
            
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Agar aap apni pasand ki movie ya series add karwana chahte hain, to navbar mein <strong className="text-yellow-400 font-bold">Yellow Star 🌟</strong> par click kar ke naam likh dein.
            </p>
            
          </div>
        </div>
      )}
    </>
  );
};

export default Hero;