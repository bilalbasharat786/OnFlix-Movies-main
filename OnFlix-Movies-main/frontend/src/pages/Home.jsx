import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Play, Heart } from 'lucide-react'; 
import Hero from '../components/Hero';
import { Helmet } from 'react-helmet-async'; 
import { AuthContext } from '../context/AuthContext'; 

// === MOVIE CARD COMPONENT ===
const MovieCard = ({ movie }) => {
  const { user, updateWishlist } = useContext(AuthContext);

  const percentage = movie.rating ? Math.round(Number(movie.rating) * 10) : 0;
  const ringColor = percentage >= 70 ? 'border-[#21d07a]' : percentage >= 50 ? 'border-[#d2d531]' : 'border-[#db2360]';
  
  const baseSlug = movie.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
  const slug = baseSlug ? `${baseSlug}-watch-online-free-hd` : '';
  
  const isSeries = movie.mediaType === 'series';
  const watchLink = isSeries ? `/watch-series/${movie._id}/${slug}` : `/watch/${movie._id}/${slug}`;

  const isWishlisted = user?.wishlist?.some(item => item.mediaId === movie._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); 
    
    if (!user) {
      alert("Please Sign In to add movies to your Wishlist!");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const body = {
        mediaId: movie._id,
        mediaType: isSeries ? 'series' : 'movie',
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
        <div className="relative overflow-hidden rounded-lg aspect-[2/3]">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        </div>

        <button 
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/80 transition z-20"
        >
          <Heart size={18} className={`transition ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-500'}`} />
        </button>

        {isSeries && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-20">
            SERIES
          </div>
        )}

        {percentage > 0 && (
          <div className={`absolute -bottom-5 left-3 w-10 h-10 md:w-11 md:h-11 bg-[#081c22] rounded-full flex items-center justify-center border-[3px] shadow-lg z-10 ${ringColor}`}>
            <span className="text-white text-xs md:text-sm font-bold">
              {percentage}<span className="text-[8px] font-normal">%</span>
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col">
        <h3 className="text-sm md:text-lg font-semibold truncate text-white" title={movie.title}>{movie.title}</h3>
        <p className="text-gray-400 text-xs md:text-sm mt-0.5">{movie.year} • {movie.language}</p>
        {movie.genres && (
          <p className="text-gray-500 text-[10px] md:text-xs truncate mt-0.5" title={movie.genres}>{movie.genres}</p>
        )}
      </div>
    </Link>
  );
};


// === MAIN HOME COMPONENT ===
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(''); 

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // 🔥 NAYA: Email double send hone se rokne ke liye useRef
  const hasSentAlert = useRef(false);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    hasSentAlert.current = false; // Search change hone pe reset karo
  }, [searchQuery, selectedYear, selectedGenre]); 

  useEffect(() => {
    const controller = new AbortController(); 

    const fetchMovies = async () => {
      if (!hasMore && page !== 1) return; 

      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const API_URL = import.meta.env.VITE_API_URL;

        if (searchQuery) {
          const [moviesRes, seriesRes] = await Promise.all([
            axios.get(`${API_URL}/api/movies/search?q=${searchQuery}&page=${page}&limit=15`, { signal: controller.signal }).catch(() => ({ data: [] })),
            axios.get(`${API_URL}/api/series/search?q=${searchQuery}&page=${page}&limit=15`, { signal: controller.signal }).catch(() => ({ data: [] }))
          ]);

          const taggedMovies = moviesRes.data.map(m => ({ ...m, mediaType: 'movie' }));
          const taggedSeries = seriesRes.data.map(s => ({ ...s, mediaType: 'series' }));
          const combinedResults = [...taggedMovies, ...taggedSeries];

          if (page === 1) setMovies(combinedResults);
          else setMovies((prevMovies) => [...prevMovies, ...combinedResults]);

          if (moviesRes.data.length < 15 && seriesRes.data.length < 15) setHasMore(false);
        } 
        else {
          let url = `${API_URL}/api/movies/all?page=${page}&limit=20`;
          if (selectedYear) url += `&year=${selectedYear}`;
          if (selectedGenre) url += `&genre=${selectedGenre}`;

          const res = await axios.get(url, { signal: controller.signal });
          const taggedMovies = res.data.map(m => ({ ...m, mediaType: 'movie' }));

          if (page === 1) setMovies(taggedMovies);
          else setMovies((prevMovies) => [...prevMovies, ...taggedMovies]);

          if (res.data.length < 20) setHasMore(false);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("⏳ Pichli search cancel kar di gayi:", searchQuery);
        } else {
          console.error("❌ Error fetching data:", error);
          // 🔥 API FAILED SCENARIO: Agar connection hi fail ho jaye
          sendErrorAlert("API Network Error (Data Fetch Failed)");
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

  // === 🔥 NAYA: FUNCTION JO BACKEND KO EMAIL BHEJNE KA KAHAY GA ===
  const sendErrorAlert = async (reason) => {
    // Check karein ke email pehle send to nahi ho gayi (loop bachane ke liye)
    // Aur agar user filter/search laga ke baitha hai jis ka sach mein koi result nahi hai, tab email na bhejey
    if (!hasSentAlert.current && !searchQuery && !selectedGenre && !selectedYear) {
      try {
        hasSentAlert.current = true; // Mark done
        const userAgentInfo = window.navigator.userAgent; // Konsa phone/browser hai

        await axios.post(`${import.meta.env.VITE_API_URL}/api/requests/error`, {
          message: reason,
          userAgent: userAgentInfo
        });
        console.log("Alert email sent.");
      } catch (err) {
        console.log("Failed to send alert email.");
      }
    }
  };

  // 🔥 CHECK FOR EMPTY RESULTS AFTER LOADING
  useEffect(() => {
    if (!loading && movies.length === 0) {
      // Data fetch to hua, magar kutch mila nahi (API ne empty array diya)
      sendErrorAlert("Homepage loaded with 0 movies (Empty Database or API Issue)");
    }
  }, [loading, movies]);


  // Infinite Scroll Listener
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

  const pageTitle = searchQuery 
    ? `Download & Watch "${searchQuery}" Free HD | On Flix` 
    : "On Flix - Watch Latest Hollywood & Bollywood Movies Online HD";
    
  const pageDescription = searchQuery
    ? `Watch and download ${searchQuery} in HD quality. On Flix offers the best streaming experience for ${searchQuery} and other top movies without ads.`
    : "Watch free movies online in HD. Stream latest Hollywood, Bollywood, and South Indian dubbed movies. No signup required, fast streaming, and free downloads.";

  return (
     <div className="min-h-screen bg-black">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      {!searchQuery && !selectedYear && !selectedGenre && (
        <Hero />
      )}

      <div className="p-4 md:p-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-red-600">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Movies"}
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
        ) : movies.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 mt-10">
            <p className="text-xl">NO RESULTS FOUND</p>
          </div>
        ) : (
          movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))
        )}
      </div>

      {loadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          <span className="ml-3 text-red-500 font-bold">Loading more...</span>
        </div>
      )}

      {!hasMore && movies.length > 0 && !loading && (
        <div className="text-center text-gray-600 py-8 font-semibold">
          ALL RESULTS LOADED
        </div>
      )}
    </div>
    </div>
  );
};

export default Home;