import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const SeriesPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data States
  const [streamData, setStreamData] = useState({ url: '', title: '' }); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const playerContainerRef = useRef(null); 

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchSeriesStream = async () => {
      try {
        setIsLoading(true);
        
        // 1. Apne backend se series ki details mangwao
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/series/${id}`);
        const seriesData = res.data;

        // 2. Series ka customUrl uthao (Jo Piexe ka player hai)
        const finalUrl = seriesData.customUrl;

        // Agar link database mein save nahi hai
        if (!finalUrl) {
            setError("Bhai, is series ka link abhi database mein available nahi hai.");
            return;
        }

        // Stream data update kar do
        setStreamData({ url: finalUrl, title: seriesData.title });

      } catch (err) {
        console.error("Series link generate karne mein masla aya:", err);
        setError("Bhai, stream link load nahi ho raha. Thori dair baad try karen.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesStream();
  }, [id]); 

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
      
      {/* SEO Tags */}
      {streamData.title && (
        <Helmet>
          <title>{`Playing ${streamData.title} | On Flix `}</title>
          <meta name="description" content={`Watching ${streamData.title} full episodes.`} />
        </Helmet>
      )}

      <div ref={playerContainerRef} className="relative w-full h-full flex items-center justify-center bg-black group">
        
        {/* 🔥 DYNAMIC IFRAME (Piexe Server) 🔥 */}
        <iframe 
          src={streamData.url} 
          allowFullScreen 
          className="w-full h-full border-none"
        ></iframe>

      </div>
    </div>
  );
};

export default SeriesPlayer;