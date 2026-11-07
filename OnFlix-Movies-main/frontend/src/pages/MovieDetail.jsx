import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Star, Clock, Calendar, ArrowLeft, MonitorPlay } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const MovieDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  
  // TMDB se aane wali extra details
  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailerKey, setTrailerKey] = useState(null);
  
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false); 

  const TMDB_API_KEY = "944a4dcfa30d2998783dd7ba8ba5c664";

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        // 1. Asal Movie ka data laana
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies/${id}`);
        const movieData = res.data;
        setMovie(movieData);

        // Related Movies Laane ka Smart Logic
        try {
            let relatedRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies/all?category=${movieData.category}&year=${movieData.year}`);
            let filteredRelated = relatedRes.data.filter(m => m._id !== movieData._id);

            if (filteredRelated.length === 0) {
                relatedRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/movies/all?category=${movieData.category}`);
                filteredRelated = relatedRes.data.filter(m => m._id !== movieData._id);
            }

            if (movieData.title) {
                const mainWord = movieData.title.split(' ')[0].toLowerCase();
                filteredRelated.sort((a, b) => {
                    const aMatch = a.title.toLowerCase().includes(mainWord);
                    const bMatch = b.title.toLowerCase().includes(mainWord);
                    if (aMatch && !bMatch) return -1;
                    if (!aMatch && bMatch) return 1;
                    return 0;
                });
            }

            setRelatedMovies(filteredRelated.slice(0, 10)); 
        } catch (relatedErr) {
            console.error("Related movies error:", relatedErr);
        }

        // 2. TMDB se Cast aur Trailer laana
        if (movieData.imdbId) {
          const findUrl = `https://api.themoviedb.org/3/find/${movieData.imdbId}?external_source=imdb_id&api_key=${TMDB_API_KEY}`;
          const tmdbRes = await axios.get(findUrl);
          
          if (tmdbRes.data.movie_results && tmdbRes.data.movie_results.length > 0) {
            const tmdbId = tmdbRes.data.movie_results[0].id;
            
            const detailRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
            setTmdbDetails(detailRes.data);

            const creditsRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`);
            setCast(creditsRes.data.cast.slice(0, 8)); 

            const videoRes = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}`);
            const ytTrailer = videoRes.data.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
            if(ytTrailer) {
                setTrailerKey(ytTrailer.key);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo(0, 0); 
    setIsTrailerPlaying(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center flex-col">
        <h1 className="text-4xl text-red-500 font-bold mb-4">Movie Not Found</h1>
        <Link to="/" className="text-gray-400 hover:text-white underline text-xl">Back To Home</Link>
      </div>
    );
  }

  const backdropUrl = tmdbDetails?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${tmdbDetails.backdrop_path}` 
    : movie.posterUrl; 
    
  const youtubeTrailerUrl = `https://www.youtube.com/embed/${trailerKey}?autoplay=1`;

  const baseSlug = movie.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
  const movieSlug = baseSlug ? `${baseSlug}-watch-online-free-hd` : '';

  return (
    <div className="min-h-screen bg-black text-white pb-16 2xl:pb-24">
      
      <Helmet>
        <title>{`Watch ${movie.title} (${movie.year || ''}) Online Free HD - ${movie.language || ''} Dubbed | On Flix `}</title>
        <meta name="description" content={`Watch ${movie.title} full movie online for free in HD quality. Stream ${movie.title} ${movie.year} ${movie.language} dubbed.`} />
      </Helmet>

      {/* === BACK BUTTON === */}
      <div className="absolute top-20 md:top-24 2xl:top-32 left-4 md:left-8 2xl:left-16 z-50">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-300 hover:text-white bg-black/50 px-4 py-2 2xl:px-6 2xl:py-3 rounded-lg transition backdrop-blur-sm hover:bg-black/80 2xl:text-xl shadow-lg">
          <ArrowLeft className="w-5 h-5 2xl:w-8 2xl:h-8" /> <span className="font-bold hidden sm:block">Back</span>
        </button>
      </div>

      {/* === TOP HERO SECTION (Backdrop + Trailer) === */}
      {/* 2xl aur 3xl TV screens ke liye height barha di gayi hai */}
      <div className={`relative w-full ${isTrailerPlaying ? 'pt-16 md:pt-0 aspect-video md:h-[70vh] lg:h-[80vh] 2xl:h-[85vh]' : 'h-[40vh] md:h-[70vh] lg:h-[80vh] 2xl:h-[85vh]'}`}>
        {isTrailerPlaying && trailerKey ? (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <iframe 
              src={youtubeTrailerUrl} 
              className="w-full h-full border-none" 
              allowFullScreen
              allow="autoplay; encrypted-media"
            ></iframe>
          </div>
        ) : (
          <>
            <img 
              src={backdropUrl} 
              alt="Backdrop" 
              // 🔥 FIX: Agar trailer nahi hai to opacity barha di hai taake poster saaf nazar aaye
              className={`w-full h-full object-cover transition-opacity duration-500 ${trailerKey ? 'opacity-40 md:opacity-50' : 'opacity-60 md:opacity-80'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* 🔥 FIX: Agar trailer hai to button show hoga, warna kutch nahi likha aayega aur poster focus mein rahega */}
              {trailerKey && (
                <button 
                  onClick={() => setIsTrailerPlaying(true)}
                  className="group flex flex-col items-center gap-3 transition transform hover:scale-110"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 2xl:w-32 2xl:h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 group-hover:border-white group-hover:bg-white/30 transition shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <Play className="w-8 h-8 md:w-10 md:h-10 2xl:w-16 2xl:h-16 text-white ml-2" fill="white" />
                  </div>
                  <span className="font-bold text-lg md:text-xl 2xl:text-3xl tracking-wider text-gray-200 group-hover:text-white transition drop-shadow-md">WATCH TRAILER</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* === MOVIE DETAILS SECTION (TV Optimized) === */}
      {/* 2xl:max-w-[1800px] lagaya hai taake 64" LED par yeh bohot chota na lagay */}
      <div className={`max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 relative z-10 ${isTrailerPlaying ? 'mt-8 md:mt-8 2xl:mt-12' : '-mt-16 md:-mt-32 2xl:-mt-48'}`}>
        <div className="flex flex-col md:flex-row gap-8 2xl:gap-16 items-center md:items-start">
          
          {/* POSTER IMAGE */}
          <div className="w-[50%] sm:w-1/3 md:w-1/4 lg:w-1/5 2xl:w-1/4 shrink-0 mx-auto md:mx-0 relative z-20">
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="w-full rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] border border-gray-700 2xl:border-2"
            />
          </div>

          <div className={`flex flex-col items-center md:items-start text-center md:text-left justify-end w-full ${isTrailerPlaying ? 'pt-0 md:pt-4 2xl:pt-8' : 'pt-2 md:pt-20 lg:pt-32 2xl:pt-48'}`}>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl 2xl:text-8xl font-black mb-3 2xl:mb-6 text-white drop-shadow-lg leading-tight">
              {movie.title}
            </h1>
            
            {/* Meta Tags */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-4 2xl:gap-6 text-xs md:text-base 2xl:text-2xl text-gray-300 mb-5 2xl:mb-8 font-medium">
              {movie.rating && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 md:w-5 md:h-5 2xl:w-7 2xl:h-7" fill="currentColor" />
                  <span className="font-bold text-white">{movie.rating}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 2xl:w-7 2xl:h-7 text-gray-400" />
                <span>{movie.year}</span>
              </div>
              {tmdbDetails?.runtime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 2xl:w-7 2xl:h-7 text-gray-400" />
                  <span>{Math.floor(tmdbDetails.runtime / 60)}h {tmdbDetails.runtime % 60}m</span>
                </div>
              )}
              <div className="px-2 py-0.5 2xl:px-4 2xl:py-1 bg-gray-800 border border-gray-700 rounded text-[10px] md:text-xs 2xl:text-lg font-bold text-red-400 uppercase tracking-wider">
                {movie.category}
              </div>
              <div className="px-2 py-0.5 2xl:px-4 2xl:py-1 bg-gray-800 border border-gray-700 rounded text-[10px] md:text-xs 2xl:text-lg font-bold text-blue-400 uppercase tracking-wider">
                {movie.language}
              </div>
            </div>

            {/* Genres */}
            {movie.genres && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 2xl:gap-4 mb-6 2xl:mb-10 w-full">
                {movie.genres.split(',').map((genre, index) => (
                  <span key={index} className="px-3 py-1 2xl:px-5 2xl:py-2 bg-gray-800/80 border border-gray-700 rounded-full text-[10px] md:text-sm 2xl:text-xl font-semibold text-gray-300 shadow-sm">
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* 🔥 NEW DUAL SERVER BUTTONS 🔥 */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-4 2xl:gap-6 mb-8 2xl:mb-12 w-full">
              {/* Button 1: Server 1 */}
              <button 
                // URL mein ?server=1 add kiya hai taake Player page ko pata chale
                onClick={() => navigate(`/play/${movie._id}/${movieSlug}?server=1`)} 
                className="flex items-center justify-center gap-2 2xl:gap-4 w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-8 py-3.5 2xl:px-12 2xl:py-5 rounded-lg font-bold text-sm md:text-base 2xl:text-2xl transition transform hover:-translate-y-1 shadow-[0_0_20px_rgba(220,38,38,0.6)]"
              >
                <Play className="w-5 h-5 2xl:w-8 2xl:h-8" fill="white" />
                SERVER 1 (VIP)
              </button>

              {/* Button 2: Server 2 */}
            
            </div>

            <p className="text-gray-300 text-sm md:text-base lg:text-lg 2xl:text-2xl leading-relaxed max-w-4xl 2xl:max-w-6xl mb-8 2xl:mb-12 px-2 md:px-0">
              {movie.description || tmdbDetails?.overview || "Is movie ki description abhi tak mojud nahi hai."}
            </p>

            {/* CAST SECTION */}
            {cast.length > 0 && (
              <div className="mt-4 2xl:mt-8 w-full">
                <h3 className="text-xl 2xl:text-3xl font-bold mb-4 2xl:mb-8 border-l-4 border-red-600 pl-3 2xl:pl-5 text-left">Top Cast</h3>
                <div className="flex overflow-x-auto gap-4 2xl:gap-8 pb-4 2xl:pb-8 scrollbar-hide">
                  {cast.map(actor => (
                    <div key={actor.id} className="flex flex-col items-center w-20 md:w-24 2xl:w-40 shrink-0">
                      <div className="w-16 h-16 md:w-24 md:h-24 2xl:w-36 2xl:h-36 rounded-full overflow-hidden bg-gray-800 border border-gray-700 mb-2 2xl:mb-4 shadow-lg">
                        {actor.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                            alt={actor.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px] md:text-xs 2xl:text-base text-center p-2">No Image</div>
                        )}
                      </div>
                      <span className="text-white text-[10px] md:text-sm 2xl:text-lg font-semibold text-center leading-tight truncate w-full">{actor.name}</span>
                      <span className="text-gray-500 text-[9px] md:text-xs 2xl:text-base text-center leading-tight truncate w-full mt-0.5 2xl:mt-1">{actor.character}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RELATED MOVIES SECTION */}
            {relatedMovies.length > 0 && (
              <div className="mt-10 2xl:mt-16 mb-12 2xl:mb-20 w-full">
                <h3 className="text-xl md:text-2xl 2xl:text-4xl font-bold mb-6 2xl:mb-10 border-l-4 border-red-600 pl-3 2xl:pl-5 text-left">
                  More Like This
                </h3>
                <div className="flex overflow-x-auto gap-4 md:gap-6 2xl:gap-10 pb-6 2xl:pb-10 scrollbar-hide">
                  {relatedMovies.map((relMovie) => (
                    <div 
                      key={relMovie._id} 
                      className="relative w-32 md:w-44 2xl:w-64 shrink-0 cursor-pointer group"
                      onClick={() => {
                        const baseRelSlug = relMovie.title ? relMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
                        const relSlug = baseRelSlug ? `${baseRelSlug}-watch-online-free-hd` : '';
                        navigate(`/watch/${relMovie._id}/${relSlug}`);
                      }}
                    >
                      <div className="overflow-hidden rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.5)] border border-gray-800 2xl:border-2">
                        <img 
                          src={relMovie.posterUrl} 
                          alt={relMovie.title} 
                          className="w-full h-48 md:h-64 2xl:h-96 object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                           <Play className="w-10 h-10 2xl:w-16 2xl:h-16 text-white drop-shadow-lg" fill="white" />
                        </div>
                      </div>
                      <h4 className="mt-3 2xl:mt-5 text-sm md:text-base 2xl:text-xl font-semibold text-gray-300 truncate text-center group-hover:text-red-500 transition-colors">
                        {relMovie.title}
                      </h4>
                      <p className="text-center text-xs 2xl:text-base text-gray-500 mt-1 2xl:mt-2">{relMovie.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
