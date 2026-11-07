import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddSeries = () => {
  // 🔥 Series State (Movies ki tarah hi, bas default category Web Series hai)
  const [series, setSeries] = useState({
    title: '',
    posterUrl: '',
    imdbId: '',
    tmdbId: '', 
    customUrl: '',
    year: new Date().getFullYear(),
    language: 'Hindi',
    category: 'Web Series',
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
  const [selectedSeriesCount, setSelectedSeriesCount] = useState(20);
  const [selectedRegion, setSelectedRegion] = useState('en'); // Default: English (Hollywood/Netflix)

  // API KEYS
  const TMDB_API_KEY = "944a4dcfa30d2998783dd7ba8ba5c664";
  const OMDB_API_KEY = "5dbcf12c"; 

  
const buildKricoSeriesUrl = (imdbId) => {
  const id = imdbId?.trim();

  if (!id || !/^tt\d+$/.test(id)) return '';

  return `https://krico443jez.com/play/s${id}?d=allmovielandapp.app`;
};

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSeries({ ...series, [e.target.name]: value });
  };

  // === SMART HYBRID FUNCTION (Manual Fetch) ===
  const fetchTMDBDetails = async () => {
    if (!series.imdbId) {
      toast.warning("Pehle IMDB ID likhein! ⚠️");
      return;
    }

    setFetchingData(true);
    try {
      // Step 1: Find TMDB ID using IMDB ID
      const tmdbUrl = `https://api.themoviedb.org/3/find/${series.imdbId.trim()}?external_source=imdb_id&api_key=${TMDB_API_KEY}`;
      const res = await axios.get(tmdbUrl);

      // Series hamesha 'tv_results' array mein aati hai
      if (res.data.tv_results && res.data.tv_results.length > 0) {
        const tmdbSeries = res.data.tv_results[0];
        const fetchedTmdbId = tmdbSeries.id; 

        // Step 2: Get Full TV Show Details
        const detailUrl = `https://api.themoviedb.org/3/tv/${fetchedTmdbId}?api_key=${TMDB_API_KEY}`;
        const detailRes = await axios.get(detailUrl);
        const fullSeriesData = detailRes.data;

        const fullPosterUrl = tmdbSeries.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}` : '';
        const fetchedGenres = fullSeriesData.genres ? fullSeriesData.genres.map(g => g.name).join(', ') : '';
        const fetchedRating = fullSeriesData.vote_average ? fullSeriesData.vote_average.toFixed(1) : '';

        const ogLang = tmdbSeries.original_language;
        let autoCategory = 'Web Series';
        let autoLanguage = 'Hindi Dubbed';

        if (ogLang === 'hi') { autoLanguage = 'Hindi'; } 
        else if (ogLang === 'en') { autoLanguage = 'Dual Audio'; } 
        else if (ogLang === 'ko') { autoCategory = 'K-Drama'; autoLanguage = 'Hindi Dubbed'; }
        else if (ogLang === 'ja') { autoCategory = 'Anime'; autoLanguage = 'Hindi Dubbed'; }

        // OMDb HYBRID MAGIC (For accurate Title and Year)
        let finalTitle = tmdbSeries.name || tmdbSeries.original_name || '';
        let finalYear = tmdbSeries.first_air_date ? tmdbSeries.first_air_date.split('-')[0] : new Date().getFullYear();

        try {
          const omdbUrl = `https://www.omdbapi.com/?i=${series.imdbId.trim()}&apikey=${OMDB_API_KEY}`;
          const omdbRes = await axios.get(omdbUrl);
          
          if (omdbRes.data && omdbRes.data.Response === "True") {
              finalTitle = omdbRes.data.Title;
              finalYear = parseInt(omdbRes.data.Year) || finalYear; 
          }
        } catch (omdbError) {
          console.error("OMDb fetch error:", omdbError);
        }

        // 🔥 URL AUTO GENERATION JADU (Piexe Player for Series) 🔥
       const autoUrl1 = buildKricoSeriesUrl(series.imdbId);

        setSeries({
          ...series,
          title: finalTitle, 
          posterUrl: fullPosterUrl,
          tmdbId: fetchedTmdbId.toString(), 
          customUrl: autoUrl1,              
          year: finalYear,  
          language: autoLanguage, 
          category: autoCategory,
          genres: fetchedGenres, 
          rating: fetchedRating  
        });

        toast.success(`Hybrid Magic! ✨ Data & Links Auto-Filled!`);
      } else {
        toast.error("Is ID ki Series TMDB par nahi mili ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Data laane mein masla aya ❌");
    } finally {
      setFetchingData(false);
    }
  };

  // === 🚀 VIP HYBRID FUNCTION: Auto-Fetch Top Series (Bulk Import) ===
  const autoFetchTopSeries = async () => {
    const regionNames = { 'en': 'Hollywood/Netflix', 'hi': 'Indian (Hindi)', 'ko': 'K-Drama', 'ja': 'Anime' };
    const regionName = regionNames[selectedRegion] || 'Series';

    const confirmImport = window.confirm(`Kya aap waqai ${selectedBulkYear} ki Top ${selectedSeriesCount} ${regionName} add karna chahte hain?`);
    if (!confirmImport) return;

    setBulkLoading(true);
    let addedCount = 0;
    let skippedCount = 0; 
    const pagesToFetch = Math.ceil(selectedSeriesCount / 20);

    try {
      for (let page = 1; page <= pagesToFetch; page++) {
        setBulkProgress(`TMDB se Page ${page}/${pagesToFetch} dhoondh raha hoon...`);
        
        // Discover TV Shows endpoint
        const discoverUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=${selectedRegion}&first_air_date_year=${selectedBulkYear}&sort_by=popularity.desc&page=${page}`;
        const res = await axios.get(discoverUrl);
        const seriesList = res.data.results;

        for (const tmdbSeries of seriesList) {
          if (addedCount >= selectedSeriesCount) break;

          try {
            if (!tmdbSeries.vote_average || tmdbSeries.vote_average < 5.0) {
              skippedCount++;
              continue; 
            }

            // Get full details to find IMDB ID (TV Shows require a specific request for external IDs)
            const externalIdsUrl = `https://api.themoviedb.org/3/tv/${tmdbSeries.id}/external_ids?api_key=${TMDB_API_KEY}`;
            const externalIdsRes = await axios.get(externalIdsUrl);
            const imdbId = externalIdsRes.data.imdb_id;

            if (!imdbId) continue;

            const detailUrl = `https://api.themoviedb.org/3/tv/${tmdbSeries.id}?api_key=${TMDB_API_KEY}`;
            const detailRes = await axios.get(detailUrl);
            const fullSeriesData = detailRes.data; 

            const fullPosterUrl = fullSeriesData.poster_path ? `https://image.tmdb.org/t/p/w500${fullSeriesData.poster_path}` : '';
            const fetchedGenres = fullSeriesData.genres ? fullSeriesData.genres.map(g => g.name).join(', ') : '';
            const fetchedRating = fullSeriesData.vote_average ? fullSeriesData.vote_average.toFixed(1) : '';

            let autoCategory = 'Web Series';
            let autoLanguage = 'Hindi Dubbed';
            if (selectedRegion === 'en') { autoLanguage = 'Dual Audio'; }
            else if (selectedRegion === 'hi') { autoLanguage = 'Hindi'; }
            else if (selectedRegion === 'ko') { autoCategory = 'K-Drama'; }
            else if (selectedRegion === 'ja') { autoCategory = 'Anime'; }

            let finalTitle = fullSeriesData.name || fullSeriesData.original_name || '';
            let finalYear = fullSeriesData.first_air_date ? fullSeriesData.first_air_date.split('-')[0] : selectedBulkYear;

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

            // 🔥 BULK URL AUTO GENERATION JADU 🔥
          const bulkUrl1 = buildKricoSeriesUrl(imdbId);

            const newSeriesData = {
              title: finalTitle, 
              posterUrl: fullPosterUrl,
              imdbId: imdbId.trim(),
              tmdbId: tmdbSeries.id.toString(), 
              customUrl: bulkUrl1,             
              year: finalYear,  
              language: autoLanguage, 
              category: autoCategory, 
              genres: fetchedGenres, 
              rating: fetchedRating  
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/series/add`, newSeriesData);
            addedCount++;
            setBulkProgress(`Abhi tak ${addedCount} Series add ho gayin...`);
            
          } catch (err) {
            console.error(`Series add karne mein masla (${tmdbSeries.name}):`, err);
          }
        }
      }
      toast.success(`🎉 Kamal ho gaya! Total ${addedCount} Series 100% Links ke sath add huin. (${skippedCount} skip ki gayin)`);
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
      // Backend Request
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/series/add`, series);

      if (response.status === 201) {
        toast.success("Series Added Successfully! 🚀");
        // Reset form
        setSeries({
          title: '', posterUrl: '', imdbId: '', tmdbId: '', customUrl: '', year: new Date().getFullYear(), language: 'Hindi', category: 'Web Series', genres: '', rating: '', isHero: false 
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding Series ❌");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  const countsList = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];
  const regionsList = [
    { code: 'en', name: 'Hollywood (English)' },
    { code: 'hi', name: 'Indian (Hindi)' },
    { code: 'ko', name: 'K-Drama (Korean)' },
    { code: 'ja', name: 'Anime (Japanese)' }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-white flex justify-between items-center">
        <span>Add New Series</span>
      </h2>

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
            <label className="block text-gray-400 text-xs mb-1">Max Series to Add</label>
            <select value={selectedSeriesCount} onChange={(e) => setSelectedSeriesCount(Number(e.target.value))} disabled={bulkLoading || loading} className="w-full p-2.5 bg-gray-800 text-white rounded font-medium border border-gray-600 focus:outline-none focus:border-red-500 text-sm">
              {countsList.map(c => ( <option key={c} value={c}>{c} Series</option> ))}
            </select>
          </div>
        </div>

        <button type="button" onClick={autoFetchTopSeries} disabled={bulkLoading || loading} className={`w-full py-3 font-bold text-white rounded shadow-lg transition-all ${bulkLoading ? 'bg-gray-600 cursor-not-allowed animate-pulse' : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'}`}>
          {bulkLoading ? `Rukiye... ${bulkProgress}` : `🚀 Fetch Hybrid Data (${selectedSeriesCount})`}
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
            <input type="text" name="imdbId" required value={series.imdbId} onChange={handleChange} className="w-full p-2.5 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-red-500" placeholder="e.g. tt10919420 (Squid Game)" />
            <button type="button" onClick={fetchTMDBDetails} disabled={fetchingData || bulkLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded font-bold whitespace-nowrap transition">
              {fetchingData ? "Fetching..." : "Fetch Hybrid Data ✨"}
            </button>
          </div>
        </div>

        {/* 🔥 NAYI FIELDS KA UI (Readonly or Editable) 🔥 */}
        <div className="p-4 bg-gray-900 border border-yellow-600 rounded space-y-3">
          <h4 className="text-yellow-500 text-sm font-bold border-b border-yellow-600/30 pb-2">Auto-Generated Player Link</h4>
          
          <div>
            <label className="block text-gray-400 text-xs mb-1">TMDB ID</label>
            <input type="text" name="tmdbId" value={series.tmdbId} onChange={handleChange} className="w-full p-2 bg-gray-800 text-gray-300 rounded border border-gray-700 focus:outline-none focus:border-yellow-500 text-sm" placeholder="Auto-filled TMDB ID" />
          </div>

          <div>
           <label className="block text-gray-400 text-xs mb-1">
  Series Player URL (Krico)
</label>
            <input type="text" name="customUrl" value={series.customUrl} onChange={handleChange} className="w-full p-2 bg-gray-800 text-gray-300 rounded border border-gray-700 focus:outline-none focus:border-yellow-500 text-sm" placeholder="https://krico443jez.com/play/stt20872936?d=allmovielandapp.app" />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Series Title (Accurate)</label>
          <input type="text" name="title" required value={series.title} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Poster URL</label>
          <input type="text" name="posterUrl" required value={series.posterUrl} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-gray-400 text-sm mb-1">Year</label>
            <input type="number" name="year" value={series.year} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm mb-1 font-bold text-red-400">Category</label>
            <select name="category" value={series.category} onChange={handleChange} className="w-full p-2 bg-gray-800 text-white rounded border border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500">
              <option>Web Series</option>
              <option>K-Drama</option>
              <option>Anime</option>
              <option>TV Shows</option>
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-gray-400 text-sm mb-1">Language</label>
            <select name="language" value={series.language} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600">
              <option>Hindi</option>
              <option>English</option>
              <option>Dual Audio</option>
              <option>Hindi Dubbed</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <label className="block text-gray-400 text-sm mb-1">Genres</label>
            <input type="text" name="genres" value={series.genres} onChange={handleChange} placeholder="Drama, Sci-Fi..." className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-gray-400 text-sm mb-1">Rating</label>
            <input type="text" name="rating" value={series.rating} onChange={handleChange} placeholder="8.5" className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600" />
          </div>
        </div>

        <div className="p-4 bg-gray-900 border border-red-500 rounded flex items-center gap-3">
          <input type="checkbox" name="isHero" id="isHero" checked={series.isHero} onChange={handleChange} className="w-5 h-5 accent-red-600 cursor-pointer" />
          <label htmlFor="isHero" className="text-white font-bold cursor-pointer select-none">Add to Hero Section</label>
        </div>

        <button type="submit" disabled={loading || bulkLoading} className={`w-full py-3 mt-4 font-bold text-white rounded transition ${loading ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}>
          {loading ? "Saving to Database..." : "Add Series to Website"}
        </button>

      </form>
    </div>
  );
};

export default AddSeries;
