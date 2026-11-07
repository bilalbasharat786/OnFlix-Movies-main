import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddMovie = () => {
  // 🔥 NAYA: customUrl2 aur tmdbId add kar diye hain
  const [movie, setMovie] = useState({
    title: '',
    posterUrl: '',
    imdbId: '',
    tmdbId: '', 
    customUrl: '',
    customUrl2: '', 
    year: new Date().getFullYear(),
    language: 'Hindi',
    category: 'Bollywood',
    genres: '',
    rating: '',
    isHero: false
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  // === 🔥 BULK IMPORT STATES ===
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const [selectedBulkYear, setSelectedBulkYear] = useState(new Date().getFullYear());
  
  // 🔥 STATES: Custom Count aur Region ke liye
  const [selectedMovieCount, setSelectedMovieCount] = useState(20);
  const [selectedRegion, setSelectedRegion] = useState('hi'); // Default: Hindi (Bollywood)

  // API KEYS
  const TMDB_API_KEY = "944a4dcfa30d2998783dd7ba8ba5c664";
  const OMDB_API_KEY = "5dbcf12c"; 
const buildKricoUrl = (imdbId) => {
  const id = imdbId?.trim();
  if (!id) return '';

  return `https://krico443jez.com/play/f${id}?d=allmovielandapp.app`;
};

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setMovie({ ...movie, [e.target.name]: value });
  };

  // === 👑 NAYA JADU: AUTO-FETCH TRENDING FOR HERO SECTION ===
  const autoAddTrendingToHero = async () => {
    const confirmTrending = window.confirm("Kya aap aaj ki TOP 5 Trending Movies ko directly Hero Section mein add karna chahte hain?");
    if (!confirmTrending) return;

    setBulkLoading(true);
    let addedCount = 0;

    try {
      // 1. TMDB se aaj ki sab se zyada Trending Movies mangwao
      const trendingUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`;
      const res = await axios.get(trendingUrl);
      
      // Sirf Top 5 Trending Movies le rahe hain
      const trendingMovies = res.data.results.slice(0, 5); 

      for (const tmdbMovie of trendingMovies) {
        setBulkProgress(`Trending add kar raha hoon: ${tmdbMovie.title}...`);

        // 2. IMDB ID ke liye full details mangwao
        const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbMovie.id}?api_key=${TMDB_API_KEY}`;
        const detailRes = await axios.get(detailUrl);
        const fullMovieData = detailRes.data;
        const imdbId = fullMovieData.imdb_id;

        if (!imdbId) continue;

        // 3. Category aur Language khud Decide karo
        const ogLang = tmdbMovie.original_language;
        let autoCategory = 'Hollywood'; 
        let autoLanguage = 'Dual Audio';

        if (ogLang === 'hi') { autoCategory = 'Bollywood'; autoLanguage = 'Hindi'; }
        else if (['te', 'ta', 'ml', 'kn'].includes(ogLang)) { autoCategory = 'Tollywood'; autoLanguage = 'Hindi Dubbed'; }
        else if (ogLang === 'ko') { autoCategory = 'K-Drama'; autoLanguage = 'Hindi Dubbed'; }

        const fullPosterUrl = fullMovieData.poster_path ? `https://image.tmdb.org/t/p/w500${fullMovieData.poster_path}` : '';
        const fetchedGenres = fullMovieData.genres ? fullMovieData.genres.map(g => g.name).join(', ') : '';
        const fetchedRating = fullMovieData.vote_average ? fullMovieData.vote_average.toFixed(1) : '';

        // 4. OMDb se accurate title/year
        let finalTitle = fullMovieData.title || '';
        let finalYear = fullMovieData.release_date ? fullMovieData.release_date.split('-')[0] : new Date().getFullYear();
        try {
            const omdbRes = await axios.get(`https://www.omdbapi.com/?i=${imdbId.trim()}&apikey=${OMDB_API_KEY}`);
            if (omdbRes.data && omdbRes.data.Response === "True") {
                finalTitle = omdbRes.data.Title;
                finalYear = parseInt(omdbRes.data.Year) || finalYear;
            }
        } catch (e) { console.error(e); }

        // 5. Links Generate karo
       const bulkUrl1 = buildKricoUrl(imdbId);

        // 6. Final Data (isHero = true ke sath)
        const trendingMovieData = {
            title: finalTitle,
            posterUrl: fullPosterUrl,
            imdbId: imdbId.trim(),
            tmdbId: tmdbMovie.id.toString(),
           customUrl: bulkUrl1,
            customUrl2: '',
            year: finalYear,
            language: autoLanguage,
            category: autoCategory,
            genres: fetchedGenres,
            rating: fetchedRating,
            isHero: true // 🔥 YAHAN AUTOMATIC TICK HO GAYA 🔥
        };

        // 7. Seedha Database mein Save karo!
        await axios.post(`${import.meta.env.VITE_API_URL}/api/movies/add`, trendingMovieData);
        addedCount++;
      }
      
      toast.success(`🎉 BAA-KAMAL! Aaj ki Top ${addedCount} Trending Movies Hero Section mein add ho gayin!`);
    } catch (error) {
      console.error(error);
      toast.error("Trending fetch karne mein masla aya ❌");
    } finally {
      setBulkLoading(false);
      setBulkProgress("");
    }
  };

  // === SMART HYBRID FUNCTION (Manual Fetch) ===
  const fetchTMDBDetails = async () => {
    if (!movie.imdbId) {
      toast.warning("Pehle IMDB ID likhein! ⚠️");
      return;
    }

    setFetchingData(true);
    try {
      const tmdbUrl = `https://api.themoviedb.org/3/find/${movie.imdbId.trim()}?external_source=imdb_id&api_key=${TMDB_API_KEY}`;
      const res = await axios.get(tmdbUrl);

      if (res.data.movie_results && res.data.movie_results.length > 0) {
        const tmdbMovie = res.data.movie_results[0];
        const fetchedTmdbId = tmdbMovie.id; 

        const detailUrl = `https://api.themoviedb.org/3/movie/${fetchedTmdbId}?api_key=${TMDB_API_KEY}`;
        const detailRes = await axios.get(detailUrl);
        const fullMovieData = detailRes.data;

        const fullPosterUrl = tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : '';
        const fetchedGenres = fullMovieData.genres ? fullMovieData.genres.map(g => g.name).join(', ') : '';
        const fetchedRating = fullMovieData.vote_average ? fullMovieData.vote_average.toFixed(1) : '';

        const ogLang = tmdbMovie.original_language;
        let autoCategory = 'Bollywood';
        let autoLanguage = 'Hindi';

        if (ogLang === 'en') { autoCategory = 'Hollywood'; autoLanguage = 'Dual Audio'; } 
        else if (['te', 'ta', 'ml', 'kn'].includes(ogLang)) { autoCategory = 'Tollywood'; autoLanguage = 'Hindi Dubbed'; } 
        else if (ogLang === 'ko') { autoCategory = 'K-Drama'; autoLanguage = 'Hindi Dubbed'; }

        let finalTitle = tmdbMovie.title || '';
        let finalYear = tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : new Date().getFullYear();

        try {
          const omdbUrl = `https://www.omdbapi.com/?i=${movie.imdbId.trim()}&apikey=${OMDB_API_KEY}`;
          const omdbRes = await axios.get(omdbUrl);
          
          if (omdbRes.data && omdbRes.data.Response === "True") {
              finalTitle = omdbRes.data.Title;
              finalYear = parseInt(omdbRes.data.Year) || finalYear; 
          }
        } catch (omdbError) {
          console.error("OMDb fetch error:", omdbError);
        }
const autoUrl1 = buildKricoUrl(movie.imdbId);

        setMovie({
          ...movie,
          title: finalTitle, 
          posterUrl: fullPosterUrl,
          tmdbId: fetchedTmdbId.toString(), 
          customUrl: autoUrl1,              
          customUrl2: '',             
          year: finalYear,  
          language: autoLanguage, 
          category: autoCategory,
          genres: fetchedGenres, 
          rating: fetchedRating  
        });

        toast.success(`Hybrid Magic! ✨ Data & Links Auto-Filled!`);
      } else {
        toast.error("Is ID ki movie TMDB par nahi mili ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Data laane mein masla aya ❌");
    } finally {
      setFetchingData(false);
    }
  };

  // === 🚀 VIP HYBRID FUNCTION: Auto-Fetch Top Movies (Bulk Import) ===
  const autoFetchTopMovies = async () => {
    const regionNames = { 'hi': 'Bollywood', 'en': 'Hollywood', 'te': 'Tollywood (Telugu)', 'ta': 'Tollywood (Tamil)', 'ko': 'South Korean' };
    const regionName = regionNames[selectedRegion] || 'Movies';

    const confirmImport = window.confirm(`Kya aap waqai ${selectedBulkYear} ki Top ${selectedMovieCount} ${regionName} movies add karna chahte hain?`);
    if (!confirmImport) return;

    setBulkLoading(true);
    let addedCount = 0;
    let skippedCount = 0; 
    const pagesToFetch = Math.ceil(selectedMovieCount / 20);

    try {
      for (let page = 1; page <= pagesToFetch; page++) {
        setBulkProgress(`TMDB se Page ${page}/${pagesToFetch} dhoondh raha hoon...`);
        
        const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=${selectedRegion}&primary_release_year=${selectedBulkYear}&sort_by=popularity.desc&page=${page}`;
        const res = await axios.get(discoverUrl);
        const moviesList = res.data.results;

        for (const tmdbMovie of moviesList) {
          if (addedCount >= selectedMovieCount) break;

          try {
            if (!tmdbMovie.vote_average || tmdbMovie.vote_average < 5.0) {
              skippedCount++;
              continue; 
            }

            const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbMovie.id}?api_key=${TMDB_API_KEY}`;
            const detailRes = await axios.get(detailUrl);
            const fullMovieData = detailRes.data; 
            const imdbId = fullMovieData.imdb_id;

            if (!imdbId) continue;

            const fullPosterUrl = fullMovieData.poster_path ? `https://image.tmdb.org/t/p/w500${fullMovieData.poster_path}` : '';
            const fetchedGenres = fullMovieData.genres ? fullMovieData.genres.map(g => g.name).join(', ') : '';
            const fetchedRating = fullMovieData.vote_average ? fullMovieData.vote_average.toFixed(1) : '';

            let autoCategory = 'Bollywood';
            let autoLanguage = 'Hindi';
            if (selectedRegion === 'en') { autoCategory = 'Hollywood'; autoLanguage = 'Dual Audio'; }
            else if (['te', 'ta'].includes(selectedRegion)) { autoCategory = 'Tollywood'; autoLanguage = 'Hindi Dubbed'; }
            else if (selectedRegion === 'ko') { autoCategory = 'K-Drama'; autoLanguage = 'Hindi Dubbed'; }

            let finalTitle = fullMovieData.title || '';
            let finalYear = fullMovieData.release_date ? fullMovieData.release_date.split('-')[0] : selectedBulkYear;

            try {
              const cleanImdbId = imdbId.trim();
                const omdbUrl = `https://www.omdbapi.com/?i=${cleanImdbId}&apikey=${OMDB_API_KEY}`;
                const omdbRes = await axios.get(omdbUrl);
                if (omdbRes.data && omdbRes.data.Response === "True") {
                    finalTitle = omdbRes.data.Title;
                    finalYear = parseInt(omdbRes.data.Year) || finalYear; 
                }
            } catch (omdbError) {
                console.error(`OMDb API masla for ${imdbId}:`, omdbError);
            }

          const bulkUrl1 = buildKricoUrl(imdbId);

            const newMovieData = {
              title: finalTitle, 
              posterUrl: fullPosterUrl,
              imdbId: imdbId.trim(),
              tmdbId: tmdbMovie.id.toString(), 
             customUrl: bulkUrl1,
              customUrl2: '',           
              year: finalYear,  
              language: autoLanguage, 
              category: autoCategory, 
              genres: fetchedGenres, 
              rating: fetchedRating  
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/movies/add`, newMovieData);
            addedCount++;
            setBulkProgress(`Abhi tak ${addedCount} Hybrid movies add ho gayin...`);
            
          } catch (err) {
            console.error(`Movie add karne mein masla (${tmdbMovie.title}):`, err);
          }
        }
      }
      toast.success(`🎉 Kamal ho gaya! Total ${addedCount} Movies 100% Links ke sath add huin. (${skippedCount} skip ki gayin)`);
    } catch (error) {
      console.error("Bulk Fetching error:", error);
      toast.error("Auto Fetch ruk gaya, check console! ❌");
    } finally {
      setBulkLoading(false);
      setBulkProgress("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/movies/add`, movie);

      if (response.status === 201) {
        toast.success("Movie Added Successfully! 🚀");
        setMovie({
          title: '', posterUrl: '', imdbId: '', tmdbId: '', customUrl: '', customUrl2: '', year: new Date().getFullYear(), language: 'Hindi', category: 'Bollywood', genres: '', rating: '', isHero: false 
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding movie ❌");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  const countsList = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];
  const regionsList = [
    { code: 'hi', name: 'Bollywood (Hindi)' },
    { code: 'en', name: 'Hollywood (English)' },
    { code: 'te', name: 'Tollywood (Telugu)' },
    { code: 'ta', name: 'Tollywood (Tamil)' },
    { code: 'ko', name: 'South Korean (K-Drama)' }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-white flex justify-between items-center">
        <span>Add New Movie</span>
      </h2>

      {/* === 👑 NAYA BUTTON: VIP TRENDING HERO MAGIC === */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-900 to-yellow-700 border-2 border-dashed border-yellow-400 rounded-lg shadow-xl">
        <h3 className="text-lg md:text-xl text-yellow-300 font-bold mb-2 text-center">👑 1-Click Trending to Hero</h3>
        <p className="text-xs md:text-sm text-yellow-100 mb-4 text-center">Aaj ki Global Top 5 Trending movies khud fetch hongi, links banenge aur seedha Hero Slider mein add ho jayengi!</p>
        
        <button type="button" onClick={autoAddTrendingToHero} disabled={bulkLoading || loading} className={`w-full py-3 font-bold text-white rounded shadow-lg transition-all ${bulkLoading ? 'bg-gray-600 cursor-not-allowed animate-pulse' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}>
          {bulkLoading ? `Rukiye... ${bulkProgress}` : `🌟 Add Top 5 Trending to Hero`}
        </button>
      </div>

      {/* === 🔥 VIP AUTO FETCH BOX === */}
      <div className="mb-8 p-4 bg-gray-900 border-2 border-dashed border-red-500 rounded-lg">
        <h3 className="text-lg md:text-xl text-red-500 font-bold mb-2 text-center">🔥 Auto-Import Magic</h3>
        <p className="text-xs md:text-sm text-gray-400 mb-4 text-center">TMDB se Poster, OMDb se 100% Accurate Title & Year aur Links khud banenge!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Industry / Region</label>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} disabled={bulkLoading || loading} className="w-full p-2.5 bg-gray-800 text-white rounded font-medium border border-gray-600 focus:outline-none focus:border-red-500 text-sm">
              {regionsList.map(r => ( <option key={r.code} value={r.code}>{r.name}</option> ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Release Year</label>
            <select value={selectedBulkYear} onChange={(e) => setSelectedBulkYear(e.target.value)} disabled={bulkLoading || loading} className="w-full p-2.5 bg-gray-800 text-white rounded font-medium border border-gray-600 focus:outline-none focus:border-red-500 text-sm">
              {yearsList.map(y => ( <option key={y} value={y}>{y}</option> ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Max Movies to Add</label>
            <select value={selectedMovieCount} onChange={(e) => setSelectedMovieCount(Number(e.target.value))} disabled={bulkLoading || loading} className="w-full p-2.5 bg-gray-800 text-white rounded font-medium border border-gray-600 focus:outline-none focus:border-red-500 text-sm">
              {countsList.map(c => ( <option key={c} value={c}>{c} Movies</option> ))}
            </select>
          </div>
        </div>

        <button type="button" onClick={autoFetchTopMovies} disabled={bulkLoading || loading} className={`w-full py-3 font-bold text-white rounded shadow-lg transition-all ${bulkLoading ? 'bg-gray-600 cursor-not-allowed animate-pulse' : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'}`}>
          {bulkLoading ? `Rukiye... ${bulkProgress}` : `🚀 Fetch Hybrid Data (${selectedMovieCount})`}
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <hr className="flex-1 border-gray-600" />
        <span className="text-gray-400 text-sm font-bold">OR ADD MANUALLY</span>
        <hr className="flex-1 border-gray-600" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">1. Paste IMDB ID First</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" name="imdbId" required value={movie.imdbId} onChange={handleChange} className="w-full p-2.5 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-red-500" placeholder="e.g. tt12844910" />
            <button type="button" onClick={fetchTMDBDetails} disabled={fetchingData || bulkLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-bold whitespace-nowrap transition">
              {fetchingData ? "Fetching..." : "Fetch Hybrid Data ✨"}
            </button>
          </div>
        </div>

     
<div>
  <label className="block text-gray-400 text-xs mb-1">
    Movie Player (Krico)
  </label>
  <input
    type="text"
    name="customUrl"
    value={movie.customUrl}
    onChange={handleChange}
    className="w-full p-2 bg-gray-800 text-gray-300 rounded border border-gray-700 focus:outline-none focus:border-yellow-500 text-sm"
    placeholder="Auto-generated Krico player URL"
  />
</div>


        <div>
          <label className="block text-gray-400 text-sm mb-1">Movie Title (Accurate)</label>
          <input type="text" name="title" required value={movie.title} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Poster URL</label>
          <input type="text" name="posterUrl" required value={movie.posterUrl} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-gray-400 text-sm mb-1">Year</label>
            <input type="number" name="year" value={movie.year} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm mb-1 font-bold text-red-400">Category</label>
            <select name="category" value={movie.category} onChange={handleChange} className="w-full p-2 bg-gray-800 text-white rounded border border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500">
              <option>Bollywood</option>
              <option>Hollywood</option>
              <option>Tollywood</option>
              <option>K-Drama</option>
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-gray-400 text-sm mb-1">Language Display</label>
            <select name="language" value={movie.language} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600">
              <option>Hindi</option>
              <option>English</option>
              <option>Dual Audio</option>
              <option>Hindi Dubbed</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <label className="block text-gray-400 text-sm mb-1">Genres (e.g. Action, Comedy)</label>
            <input type="text" name="genres" value={movie.genres} onChange={handleChange} placeholder="Action, Thriller, Romance..." className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-gray-400 text-sm mb-1">Rating (e.g. 8.5)</label>
            <input type="text" name="rating" value={movie.rating} onChange={handleChange} placeholder="8.5" className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
        </div>

        <div className="p-4 bg-gray-900 border border-red-500 rounded flex items-center gap-3">
          <input type="checkbox" name="isHero" id="isHero" checked={movie.isHero} onChange={handleChange} className="w-5 h-5 accent-red-600 cursor-pointer" />
          <label htmlFor="isHero" className="text-white font-bold cursor-pointer select-none">Add to Hero Section</label>
        </div>

        <button type="submit" disabled={loading || bulkLoading} className={`w-full py-3 mt-4 font-bold text-white rounded transition ${loading ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
          {loading ? "Saving to Database..." : "Add Movie to Website"}
        </button>

      </form>
    </div>
  );
};

export default AddMovie;
