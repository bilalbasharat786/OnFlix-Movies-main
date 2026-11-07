import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom'; 
import { Play, Heart } from 'lucide-react'; 
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext'; // 🔥 NAYA: Context API import ki

// === 🔥 NAYA: SERIES CARD COMPONENT (Wishlist ke sath) ===
const SeriesCard = ({ item }) => {
  const { user, updateWishlist } = useContext(AuthContext); // Context se user data nikala

  const percentage = item.rating ? Math.round(Number(item.rating) * 10) : 0;
  const ringColor = percentage >= 70 ? 'border-[#21d07a]' : percentage >= 50 ? 'border-[#d2d531]' : 'border-[#db2360]';
  
  const baseSlug = item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
  const slug = baseSlug ? `${baseSlug}-watch-online-free-hd` : '';
  const watchLink = `/watch-series/${item._id}/${slug}`;
  
  // 🔥 Check karein ke kya yeh series pehle se wishlist mein hai?
  const isWishlisted = user?.wishlist?.some(w => w.mediaId === item._id);

  // 🔥 Wishlist Toggle Function
  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Link ko click hone se roke ga
    
    // Agar user login nahi hai to simply alert show karo
    if (!user) {
      alert("Please Sign In to add series to your Wishlist!");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const body = {
        mediaId: item._id,
        mediaType: 'series',
        title: item.title,
        posterUrl: item.posterUrl,
        rating: item.rating,
        year: item.year
      };

      // Backend par bhejo aur wapis naya wishlist array lo
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/wishlist`, body, config);
      updateWishlist(res.data.wishlist); // Jese hi data aaye, website ka Heart lal (red) kar do
    } catch (error) {
      console.error("Wishlist error", error);
    }
  };

  return (
    <Link to={watchLink} className="group relative shadow-lg flex flex-col cursor-pointer">
      
      <div className="relative w-full">
        <div className="relative overflow-hidden rounded-lg aspect-[2/3] border border-gray-800 group-hover:border-red-600 transition-colors duration-300">
          <img 
            src={item.posterUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold py-1 px-3 rounded shadow-lg text-sm">Play Now</span>
          </div>
        </div>

        {/* 🔥 WISHLIST HEART BUTTON 🔥 */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-20 p-2 bg-[#081c22]/80 backdrop-blur-md rounded-full hover:scale-110 transition-transform shadow-lg border border-gray-700"
        >
          <Heart 
            size={18} 
            className={`transition-colors duration-300 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-white'}`} 
          />
        </button>

        {percentage > 0 && (
          <div className={`absolute -bottom-5 left-3 w-10 h-10 md:w-11 md:h-11 bg-[#081c22] rounded-full flex items-center justify-center border-[3px] shadow-lg z-10 ${ringColor}`}>
            <span className="text-white text-xs md:text-sm font-bold">
              {percentage}<span className="text-[8px] font-normal">%</span>
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col">
        <h3 className="text-sm md:text-lg font-semibold truncate text-white group-hover:text-red-500 transition-colors" title={item.title}>{item.title}</h3>
        <p className="text-gray-400 text-xs md:text-sm mt-0.5">{item.year} • {item.language}</p>
        
        {item.genres && (
          <p className="text-gray-500 text-[10px] md:text-xs truncate mt-0.5" title={item.genres}>
            {item.genres}
          </p>
        )}
      </div>
    </Link>
  );
};


// === 🎬 MAIN WEB SERIES COMPONENT ===
const WebSeries = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // === 🚀 STATES ===
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // 🔥 FILTERS STATES
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(''); 

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  // 1. Jab Search, Year ya Genre badlay, to page 1 aur series reset kardo
  useEffect(() => {
    setSeries([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, selectedYear, selectedGenre]); 

  // 2. Backend se series mangwana
  useEffect(() => {
    const controller = new AbortController(); 

    const fetchSeriesData = async () => {
      if (!hasMore && page !== 1) return; 

      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        let url = "";
        
        if (searchQuery) {
          url = `${import.meta.env.VITE_API_URL}/api/series/search?q=${searchQuery}&page=${page}&limit=20`;
        } else {
          url = `${import.meta.env.VITE_API_URL}/api/series/all?page=${page}&limit=20`;
        }

        if (selectedYear) {
            url += `&year=${selectedYear}`;
        }

        if (selectedGenre) {
            url += `&genre=${selectedGenre}`;
        }

        const res = await axios.get(url, { signal: controller.signal });

        if (page === 1) {
          setSeries(res.data);
        } else {
          setSeries((prevSeries) => [...prevSeries, ...res.data]);
        }

        if (res.data.length < 20) {
          setHasMore(false);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching series:", error);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    const delayTimer = setTimeout(() => {
      fetchSeriesData();
    }, 300);

    return () => {
      clearTimeout(delayTimer); 
      controller.abort(); 
    };
  }, [page, searchQuery, selectedYear, selectedGenre]); 

  // 3. Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 1 >= document.documentElement.scrollHeight) {
        if (hasMore && !loading && !loadingMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadingMore]);

  // Filters Lists
  const yearsList = Array.from({ length: 27 }, (_, i) => 2026 - i);
  const genresList = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "Mystery", "Romance", "Sci-Fi", "Thriller"];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black">
       <Helmet>
        <title>Web Series (Hindi Dubbed) - Watch All Seasons | On Flix </title>
        <meta name="description" content="Binge-watch the best Web Series, TV Shows, and Dramas dubbed in Hindi. Watch all seasons and episodes in HD quality on On Flix ." />
      </Helmet>
      
      {/* HEADER AUR FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-red-600">
          <Helmet>
        <title>
          {searchQuery 
            ? `Search Results for "${searchQuery}" | On Flix ` 
            : "Latest Web Series & TV Shows | On Flix "}
        </title>
        <meta name="description" content="Stream and download the latest Web Series and Seasons in HD quality on On Flix ." />
      </Helmet>
          {searchQuery ? `Search: ${searchQuery}` : 'Top Web Series'}
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Genre Dropdown */}
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 shadow-lg flex-1 md:flex-none justify-between md:justify-start">
                <label className="text-gray-400 font-semibold text-sm whitespace-nowrap">Genre:</label>
                <select 
                    value={selectedGenre} 
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="bg-black text-red-500 font-bold border-none focus:outline-none focus:ring-0 cursor-pointer text-sm w-full md:w-auto text-right md:text-left"
                >
                    <option value="">All</option>
                    {genresList.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>

            {/* Year Dropdown */}
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 shadow-lg flex-1 md:flex-none justify-between md:justify-start">
                <label className="text-gray-400 font-semibold text-sm whitespace-nowrap">Year:</label>
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-black text-red-500 font-bold border-none focus:outline-none focus:ring-0 cursor-pointer text-sm w-full md:w-auto text-right md:text-left"
                >
                    <option value="">All</option>
                    {yearsList.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-x-6 md:gap-y-10">
        {loading && page === 1 ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-800 h-64 rounded-lg mb-2"></div>
              <div className="bg-gray-800 h-4 w-3/4 rounded"></div>
            </div>
          ))
        ) : series.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 mt-10">
            <p className="text-xl font-bold tracking-widest text-red-500/50">SERIES NOT FOUND</p>
          </div>
        ) : (
          // 🔥 NAYA: Ab yahan seedha SeriesCard component call hoga
          series.map((item) => (
            <SeriesCard key={item._id} item={item} />
          ))
        )}
      </div>

      {loadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          <span className="ml-3 text-red-500 font-bold tracking-wider">Loading more series...</span>
        </div>
      )}

      {!hasMore && series.length > 0 && !loading && (
        <div className="text-center text-gray-600 py-8 font-semibold tracking-widest">
          ALL SERIES LOADED
        </div>
      )}
    </div>
  );
};

export default WebSeries;