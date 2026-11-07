import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Play, Heart } from 'lucide-react'; // 🔥 Heart icon add kiya
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext'; // 🔥 Context API add ki

// === 🔥 NAYA: MOVIE CARD COMPONENT (Wishlist ke sath) ===
const MovieCard = ({ movie }) => {
  const { user, updateWishlist } = useContext(AuthContext); 

  const percentage = movie.rating ? Math.round(Number(movie.rating) * 10) : 0;
  const ringColor = percentage >= 70 ? 'border-[#21d07a]' : percentage >= 50 ? 'border-[#d2d531]' : 'border-[#db2360]';
  
  const baseSlug = movie.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
  const slug = baseSlug ? `${baseSlug}-watch-online-free-hd` : '';
  const watchLink = `/watch/${movie._id}/${slug}`;

  // 🔥 Check karein ke kya yeh movie wishlist mein hai?
  const isWishlisted = user?.wishlist?.some(item => item.mediaId === movie._id);

  // 🔥 Wishlist Toggle Function (Alert ke sath)
  const handleWishlistToggle = async (e) => {
    e.preventDefault(); 
    
    if (!user) {
      alert("Please Sign In to add movies to your Wishlist!"); // 🔥 Simple Alert
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const body = {
        mediaId: movie._id,
        mediaType: 'movie',
        title: movie.title,
        posterUrl: movie.posterUrl,
        rating: movie.rating,
        year: movie.year
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/wishlist`, body, config);
      updateWishlist(res.data.wishlist); 
    } catch (error) {
      console.error("Wishlist error", error);
    }
  };

  return (
    <Link to={watchLink} className="group relative shadow-lg flex flex-col cursor-pointer">
      
      <div className="relative w-full">
        <div className="relative overflow-hidden rounded-lg aspect-[2/3] border border-gray-800 group-hover:border-blue-500 transition-colors duration-300">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-blue-600 text-white font-bold py-1 px-3 rounded shadow-lg text-sm">Play Now</span>
          </div>
        </div>

        {/* 🔥 WISHLIST HEART BUTTON 🔥 */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-2 bg-[#081c22]/80 backdrop-blur-md rounded-full hover:scale-110 transition z-20"
        >
          <Heart size={18} className={`transition ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-500'}`} />
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
        <h3 className="text-sm md:text-lg font-semibold truncate text-white group-hover:text-blue-400 transition-colors" title={movie.title}>{movie.title}</h3>
        <p className="text-gray-400 text-xs md:text-sm mt-0.5">{movie.year} • {movie.language}</p>
        
        {movie.genres && (
          <p className="text-gray-500 text-[10px] md:text-xs truncate mt-0.5" title={movie.genres}>
            {movie.genres}
          </p>
        )}
      </div>
    </Link>
  );
};

// === 🎬 MAIN HOLLYWOOD COMPONENT ===
const Hollywood = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(''); 

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, selectedYear, selectedGenre]); 

  useEffect(() => {
    const controller = new AbortController(); 

    const fetchMovies = async () => {
      if (!hasMore && page !== 1) return; 

      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        let url = "";
        
        if (searchQuery) {
          url = `${import.meta.env.VITE_API_URL}/api/movies/search?q=${searchQuery}&page=${page}&limit=20&category=Hollywood`;
        } else {
          url = `${import.meta.env.VITE_API_URL}/api/movies/all?page=${page}&limit=20&category=Hollywood`;
        }

        if (selectedYear) {
            url += `&year=${selectedYear}`;
        }

        if (selectedGenre) {
            url += `&genre=${selectedGenre}`;
        }

        const res = await axios.get(url, { signal: controller.signal });

        if (page === 1) {
          setMovies(res.data);
        } else {
          setMovies((prevMovies) => [...prevMovies, ...res.data]);
        }

        if (res.data.length < 20) {
          setHasMore(false);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching movies:", error);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    const delayTimer = setTimeout(() => {
      fetchMovies();
    }, 300);

    return () => {
      clearTimeout(delayTimer); 
      controller.abort(); 
    };
  }, [page, searchQuery, selectedYear, selectedGenre]); 

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

  const yearsList = Array.from({ length: 27 }, (_, i) => 2026 - i);
  const genresList = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Sci-Fi", "Thriller", "War"];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-black">
       <Helmet>
        <title>Hollywood Movies (Hindi Dubbed) - Blockbusters | On Flix </title>
        <meta name="description" content="Enjoy the best South Indian Hollywood movies dubbed in Hindi. High-octane action, drama, and thriller movies on On Flix ." />
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-blue-500">
          <Helmet>
        <title>
          {searchQuery 
            ? `Search Results for "${searchQuery}" | On Flix ` 
            : "Hollywood Movies - Watch Latest South Indian Films | On Flix "}
        </title>
        <meta name="description" content="Stream and download the latest and classic Hollywood movies in HD quality on On Flix . Explore romance, action, and drama." />
      </Helmet>
          {searchQuery ? `Search: ${searchQuery}` : 'Hollywood Movies'}
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 shadow-lg flex-1 md:flex-none justify-between md:justify-start">
                <label className="text-gray-400 font-semibold text-sm whitespace-nowrap">Genre:</label>
                <select 
                    value={selectedGenre} 
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="bg-black text-blue-400 font-bold border-none focus:outline-none focus:ring-0 cursor-pointer text-sm w-full md:w-auto text-right md:text-left"
                >
                    <option value="">All</option>
                    {genresList.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-900 px-3 py-2 rounded-lg border border-gray-700 shadow-lg flex-1 md:flex-none justify-between md:justify-start">
                <label className="text-gray-400 font-semibold text-sm whitespace-nowrap">Year:</label>
                <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-black text-blue-400 font-bold border-none focus:outline-none focus:ring-0 cursor-pointer text-sm w-full md:w-auto text-right md:text-left"
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
        ) : movies.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 mt-10">
            <p className="text-xl font-bold tracking-widest text-blue-500/50">
                {selectedYear || selectedGenre ? 'NOT FOUND' : 'NOT FOUND'}
            </p>
          </div>
        ) : (
          movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} /> // 🔥 NAYA CODE: Loop mein component
          ))
        )}
      </div>

      {loadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-blue-400 font-bold">Loading more Hollywood movies...</span>
        </div>
      )}

      {!hasMore && movies.length > 0 && !loading && (
        <div className="text-center text-gray-600 py-8 font-semibold">
          ALL HOLLYWOOD MOVIES LOADED
        </div>
      )}
    </div>
  );
};

export default Hollywood;