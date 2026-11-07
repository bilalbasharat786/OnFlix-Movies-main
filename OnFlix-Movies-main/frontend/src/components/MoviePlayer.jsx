import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';

const MoviePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // 🔥 Data States (Is mein 'title' add kiya hai taake Google ko movie ka naam pata chale)
  const [streamData, setStreamData] = useState({ url: '', title: '', isEmbed: true }); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const playerContainerRef = useRef(null); 

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Movie Data Mangwane Wala Effect
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setIsLoading(true);
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies/${id}`);
        const movieData = res.data;

        const queryParams = new URLSearchParams(location.search);
        const serverChoice = queryParams.get('server'); 

        let finalUrl = '';

        if (serverChoice === '2') {
            finalUrl = movieData.customUrl2;
            if (!finalUrl) finalUrl = movieData.customUrl; 
        } 
        else {
            finalUrl = movieData.customUrl;
            if (!finalUrl) finalUrl = movieData.customUrl2;
        }

        if (!finalUrl) {
            setError("Bhai, is movie ka link abhi database mein available nahi hai.");
            return;
        }

        // 🔥 URL aur Title dono save kar diye
        setStreamData({ url: finalUrl, title: movieData.title || 'Unknown Movie', isEmbed: true });

      } catch (err) {
        console.error("Movie link generate karne mein masla aya:", err);
        setError("Bhai, stream link load nahi ho raha. Thori dair baad try karen.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStream();
  }, [id, location.search]); 

  // 🔥 JADU: The Google Analytics Heartbeat System 🔥
  useEffect(() => {
    // Agar movie URL load nahi hua, to timer mat chalao
    if (!streamData.url) return;

    // Har 5 minute (300,000 milliseconds) baad Google Analytics ko Ping bhejo
    const pingInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'watching_movie_ping', {
          'event_category': 'User Engagement',
          'event_label': streamData.title, // Movie ka naam
          'value': 5 // Har ping ka matlab 5 minute
        });
        console.log(`GA4 Ping Sent: User is still watching ${streamData.title}`);
      }
    }, 300000); // 300000 ms = 5 mins

    // Jab user back chala jaye ya player band kar de, to timer rok do
    return () => clearInterval(pingInterval);
  }, [streamData]); // Jab streamData update ho tab yeh system active ho


  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center">
        <Loader2 className="animate-spin text-red-600 w-12 h-12 mb-4" />
        <p className="text-gray-500 animate-pulse text-sm tracking-widest">CONNECTING TO SERVER...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center text-white">
        <p className="mb-4 text-red-500 font-bold text-center px-4">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-700 transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-50 flex items-center justify-center">

      <div ref={playerContainerRef} className="relative w-full h-full flex items-center justify-center bg-black group">
        
        {/* 🔥 DYNAMIC IFRAME (Server 1 ya Server 2 jo bhi select hua ho) 🔥 */}
        <iframe 
          src={streamData.url} 
          allowFullScreen 
          className="w-full h-full border-none"
          referrerPolicy="no-referrer"
        ></iframe>

      </div>
    </div>
  );
};

export default MoviePlayer;