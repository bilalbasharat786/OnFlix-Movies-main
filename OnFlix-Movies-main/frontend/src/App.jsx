import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4'; // 🔥 NAYA: Google Analytics Package

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MoviePlayer from './components/MoviePlayer';
import SeriesPlayer from './components/SeriesPlayer'; 
import Profile from './pages/Profile';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Hollywood from './pages/Hollywood';
import Bollywood from './pages/Bollywood';
import Tollywood from './pages/Tollywood';
import Wishlist from './pages/Wishlist';

// Series Pages
import WebSeries from './pages/WebSeries';
import SeriesDetail from './pages/SeriesDetail';

// === 🔥 NAYA: ANALYTICS TRACKER COMPONENT ===
// Yeh component har page badalne par Google ko bata dega
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null; // Iska koi UI nahi hai, yeh sirf peeche kaam karta hai
};

const App = () => {
  
  // === 🔥 NAYA: INITIALIZE GOOGLE ANALYTICS ===
  useEffect(() => {
    // Aap ki asli Measurement ID yahan laga di gayi hai
    ReactGA.initialize("G-847KBV3KSW"); 
  }, []);

  // === 📺 EFFECT 1: GATEWAY SECURITY, TV NAVIGATION & ANTI-KEYBOARD SHORTCUTS ===
  useEffect(() => {
    // 🔥 2. Global Keyboard Navigation & Security Trap
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const activeElement = document.activeElement;
        if (activeElement && (
          activeElement.tagName === 'A' || 
          activeElement.tagName === 'BUTTON' || 
          activeElement.getAttribute('role') === 'link'
        )) {
          e.preventDefault();
          activeElement.click();
        }
      }

      // ==========================================
      // 🔥 3. ANTI-DOWNLOAD / ANTI-INSPECT LOGIC 🔥
      // ==========================================
      const redirectUrl = "https://redonflixmovies.vercel.app/";

      if (e.key === 'F12') {
        e.preventDefault();
        window.location.replace(redirectUrl);
      }
      
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        window.location.replace(redirectUrl);
      }

      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        window.location.replace(redirectUrl);
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        console.log("⚠️ Security Alert: Saving page is disabled.");
        window.location.replace(redirectUrl); 
      }
    };

    const firstFocus = document.querySelector('a, button, input');
    if (firstFocus) firstFocus.focus();

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // === 🛡️ EFFECT 2: ADVANCED ANTI-INSPECT (SCREEN RESIZE DETECTION) ===
  useEffect(() => {
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 200;
      const heightThreshold = window.outerHeight - window.innerHeight > 200;

      if (widthThreshold || heightThreshold) {
        window.location.replace('https://redonflixmovies.vercel.app/'); 
      }
    };

    detectDevTools();
    window.addEventListener('resize', detectDevTools);
    return () => window.removeEventListener('resize', detectDevTools);
  }, []);

  // === 🎬 MAIN APPLICATION ===
  return (
    <Router>
      {/* 🔥 NAYA: Tracker ko Router ke foran andar laga diya */}
      <AnalyticsTracker />
      
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hero" element={<Hero />} />
          <Route path="/hollywood" element={<Hollywood />} />
          <Route path="/bollywood" element={<Bollywood />} />
          <Route path="/tollywood" element={<Tollywood />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/watch/:id/:titleSlug?" element={<MovieDetail />} />
          <Route path="/play/:id/:titleSlug?" element={<MoviePlayer />} />
          <Route path="/web-series" element={<WebSeries />} />
          <Route path="/watch-series/:id/:titleSlug?" element={<SeriesDetail />} />
          <Route path="/play-series/:id/:titleSlug?" element={<SeriesPlayer />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
