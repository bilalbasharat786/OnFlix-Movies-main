import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ManageSeries({ categoryTitle }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // === CHECKER STATE ===
  const [vidStatus, setVidStatus] = useState({});

  // === SEARCH, YEAR & PAGINATION STATES ===
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const seriesPerPage = 20; 

  // Edit Modal states 
  const [editingSeries, setEditingSeries] = useState(null);
  
  // 🔥 Series ke hisaab se formData (Sirf ek customUrl)
  const [formData, setFormData] = useState({ 
    title: '', posterUrl: '', imdbId: '', tmdbId: '', customUrl: '', year: '', language: '', category: '', genres: '', rating: '', isHero: false 
  });

  const [previewLink, setPreviewLink] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchSeries = async () => {
    try {
      setLoading(true);
      // 🔥 Endpoint changed to /api/series/
      let url = `${API_BASE_URL}/api/series/all?limit=10000`;
      if (selectedYear) {
        url += `&year=${selectedYear}`;
      }
      const response = await axios.get(url);

      const filteredSeries = response.data.filter((item) => {
        // 🔥 Categories adapted for Series
        if (categoryTitle.toLowerCase().includes("korean") || categoryTitle.toLowerCase().includes("k-drama")) {
          return item.category === 'K-Drama';
        } else if (categoryTitle.toLowerCase().includes("anime")) {
          return item.category === 'Anime'; 
        } else {
          return true; // Default 'All Series'
        }
      });
      
      setSeries(filteredSeries);
      setLoading(false);
    } catch (error) {
      console.error("❌ [FETCH ERROR]:", error);
      toast.error("Series load nahi ho rahin!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
    setSearchTerm(''); 
    setCurrentPage(1); 
  }, [categoryTitle, selectedYear]);

  const searchedSeries = series.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastSeries = currentPage * seriesPerPage;
  const indexOfFirstSeries = indexOfLastSeries - seriesPerPage;
  const currentSeries = searchedSeries.slice(indexOfFirstSeries, indexOfLastSeries);
  const totalPages = Math.ceil(searchedSeries.length / seriesPerPage);

  // Link Checker Logic
  const checkVidSrcStatus = async (seriesToCheck) => {
    const initialStatus = { ...vidStatus }; 
    seriesToCheck.forEach(m => {
      if (m.customUrl && m.customUrl !== "") {
        initialStatus[m._id] = 'custom';
      } else if (!initialStatus[m._id]) { 
        initialStatus[m._id] = 'checking'; 
      }
    });
    setVidStatus(initialStatus);

    for (const item of seriesToCheck) {
      if (!item.customUrl || item.customUrl === "") {
        try {
          // Fallback check if customUrl is empty
          const checkUrl = `https://piexe411qok.com/play/${item.imdbId}`;
          const { data } = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(checkUrl)}`);
          const htmlCode = data.contents || "";
          if (htmlCode.includes("unavailable at the moment") || htmlCode.includes("404 Not Found")) {
            setVidStatus(prev => ({ ...prev, [item._id]: 'missing' }));
          } else {
            setVidStatus(prev => ({ ...prev, [item._id]: 'working' }));
          }
        } catch (error) {
          setVidStatus(prev => ({ ...prev, [item._id]: 'error' }));
        }
      }
    }
  };

  useEffect(() => {
    if (currentSeries.length > 0) {
      checkVidSrcStatus(currentSeries);
    }
  }, [currentPage, searchTerm, series]); 

  const handleEditClick = (item) => {
    setEditingSeries(item._id);
    setFormData({ 
      title: item.title || '', 
      posterUrl: item.posterUrl || '', 
      imdbId: item.imdbId || '', 
      tmdbId: item.tmdbId || '', 
      customUrl: item.customUrl || '', 
      year: item.year || '', 
      language: item.language || 'Hindi', 
      category: item.category || 'Web Series',
      genres: item.genres || '', 
      rating: item.rating || '',
      isHero: item.isHero || false 
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/series/${editingSeries}`, formData);
      toast.success("Series Updated Successfully! 🎉");
      setEditingSeries(null); 
      fetchSeries(); 
    } catch (error) {
      toast.error("Update fail!");
    }
  };

  const handleDelete = async (id, title) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/series/${id}`);
      toast.success(`🗑️ Deleted!`);
      fetchSeries(); 
    } catch (error) {
      toast.error("Delete failed!");
    }
  };

  const openPreview = (item) => {
    const linkToCheck = item.customUrl && item.customUrl !== "" 
      ? item.customUrl 
      : `https://piexe411qok.com/play/${item.imdbId}`;
    setPreviewLink(linkToCheck);
  };

  const yearsList = Array.from({ length: 27 }, (_, i) => 2026 - i);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-4 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <h2 className="text-3xl font-black text-white">Manage <span className="text-red-600">{categoryTitle || 'Series'}</span></h2>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-600">
            <label className="text-gray-400 font-bold text-sm">Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent text-red-600 font-bold outline-none text-sm cursor-pointer">
              <option value="">All Years</option>
              {yearsList.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>
        <div className="w-full md:w-1/3">
          <input type="text" placeholder="Search Series..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 outline-none" />
        </div>
      </div>

      {previewLink && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden border border-gray-700 relative">
            <div className="bg-gray-800 p-3 flex justify-between items-center">
              <span className="text-yellow-400 font-bold">🔍 Testing Player (Piexe)</span>
              <button onClick={() => setPreviewLink(null)} className="text-white bg-red-600 px-4 py-1 rounded font-bold">Close</button>
            </div>
            <iframe src={previewLink} className="w-full h-[60vh] md:h-[70vh]" frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      )}

      {/* === EDIT SERIES MODAL === */}
      {editingSeries && (
        <div className="bg-gray-800 p-6 md:p-8 rounded-xl mb-10 border border-red-900/50 shadow-2xl relative z-40 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <button onClick={() => setEditingSeries(null)} className="absolute top-4 right-6 text-gray-400 hover:text-red-500 font-bold text-2xl">✕</button>
          <h3 className="text-2xl text-white font-bold mb-6 pr-8">Edit: <span className="text-red-500">{formData.title}</span></h3>
          
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Series Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600 focus:border-red-500" />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-1">IMDB ID</label>
              <input type="text" value={formData.imdbId} onChange={(e) => setFormData({...formData, imdbId: e.target.value})} className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600 focus:border-red-500" />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">TMDB ID</label>
              <input type="text" value={formData.tmdbId} onChange={(e) => setFormData({...formData, tmdbId: e.target.value})} className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600 focus:border-red-500" />
            </div>
            
            {/* Custom URL (Piexe Player) */}
            <div className="md:col-span-2 p-4 bg-gray-900 border border-yellow-600/50 rounded space-y-4">
                <div>
                  <label className="block text-yellow-500 mb-1 font-bold text-sm">Series Player URL (Piexe)</label>
                  <input type="text" value={formData.customUrl} onChange={(e) => setFormData({...formData, customUrl: e.target.value})} className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600 focus:border-yellow-500" />
                </div>
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-4 md:col-span-2">
              <div className="w-full md:w-1/3"><label className="block text-gray-400 mb-1">Year</label><input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600" /></div>
              <div className="w-full md:w-1/3">
                <label className="block text-gray-400 mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600">
                  <option>Web Series</option>
                  <option>K-Drama</option>
                  <option>Anime</option>
                  <option>TV Shows</option>
                </select>
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-gray-400 mb-1">Language</label>
                <select value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})} className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600">
                  <option>Hindi</option>
                  <option>English</option>
                  <option>Dual Audio</option>
                  <option>Hindi Dubbed</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-4 md:col-span-2">
              <div className="w-full md:w-2/3"><label className="block text-gray-400 mb-1">Genres</label><input type="text" value={formData.genres} onChange={(e) => setFormData({...formData, genres: e.target.value})} className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600" /></div>
              <div className="w-full md:w-1/3"><label className="block text-gray-400 mb-1">Rating</label><input type="text" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600" /></div>
            </div>

            <div className="md:col-span-2 p-4 bg-gray-900 border border-red-600 rounded flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="isHeroEdit"
                    checked={formData.isHero} 
                    onChange={(e) => setFormData({...formData, isHero: e.target.checked})} 
                    className="w-5 h-5 accent-red-600 cursor-pointer"
                />
                <label htmlFor="isHeroEdit" className="text-white font-bold cursor-pointer select-none">
                    Hero Slider
                </label>
            </div>

            <div className="md:col-span-2"><label className="block text-gray-400 mb-1">Poster URL</label><input type="text" value={formData.posterUrl} onChange={(e) => setFormData({...formData, posterUrl: e.target.value})} required className="w-full p-3 bg-gray-700 text-white rounded outline-none border border-gray-600" /></div>
            <div className="md:col-span-2 mt-4"><button type="submit" className="w-full bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700 transition">Save Changes</button></div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-red-500 py-10 font-bold">Series loading...</div>
      ) : searchedSeries.length === 0 ? (
        <div className="text-center text-gray-400 py-10 font-bold">SERIES NOT FOUND</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {currentSeries.map((item) => {
              const currentStatus = vidStatus[item._id] || 'checking';
              const badgeClass = currentStatus === 'custom' ? "bg-green-600" : currentStatus === 'working' ? "bg-blue-600" : currentStatus === 'missing' ? "bg-red-600" : "bg-gray-600";
              
              return (
                <div key={item._id} className={`bg-gray-800 rounded-lg overflow-hidden flex flex-col border-2 transition-all ${currentStatus === 'missing' ? 'border-red-600 shadow-lg shadow-red-900/20' : 'border-gray-700'}`}>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-[10px] font-bold text-white shadow-md backdrop-blur-sm border border-white/20 ${badgeClass}`}>
                      {currentStatus.toUpperCase()}
                  </div>
                  
                  <div className="h-56 w-full bg-gray-900">
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold text-white truncate" title={item.title}>{item.title}</h3>
                    <div className="mt-auto flex gap-1 pt-2">
                      <button onClick={() => openPreview(item)} className="bg-yellow-600 text-white flex-1 py-1 rounded text-[10px] font-bold hover:bg-yellow-700 transition">Check</button>
                      <button onClick={() => handleEditClick(item)} className="bg-gray-600 text-white flex-1 py-1 rounded text-[10px] font-bold hover:bg-gray-500 transition">Edit</button>
                      <button onClick={() => handleDelete(item._id, item.title)} className="bg-red-600 text-white flex-1 py-1 rounded text-[10px] font-bold hover:bg-red-700 transition">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-700">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded font-bold bg-red-600 text-white disabled:bg-gray-700 hover:bg-red-700 transition disabled:hover:bg-gray-700">Prev</button>
                <span className="text-white font-bold">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded font-bold bg-red-600 text-white disabled:bg-gray-700 hover:bg-red-700 transition disabled:hover:bg-gray-700">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}