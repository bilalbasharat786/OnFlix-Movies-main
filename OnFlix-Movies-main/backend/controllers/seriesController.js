import Series from '../models/seriesModel.js'; 

// 1. Add Series
export const addSeries = async (req, res) => {
    try {
        console.log("Request received to ADD Series:", req.body.title);
        const newSeries = new Series(req.body);
        const savedSeries = await newSeries.save();
        console.log("Series Saved Successfully:", savedSeries._id);
        res.status(201).json(savedSeries);
    } catch (error) {
        console.error("Error adding Series:", error);
        res.status(500).json(error);
    }
};

// 2. Get All Series (with Pagination, CATEGORY & GENRE Filter)
export const getSeries = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const categoryFilter = req.query.category; 
    const yearFilter = req.query.year; 
    const genreFilter = req.query.genre; 

    try {
        let query = {};
        if (categoryFilter) query.category = categoryFilter; 
        if (yearFilter) query.year = parseInt(yearFilter);
        if (genreFilter) query.genres = { $regex: genreFilter, $options: 'i' }; 

        const series = await Series.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        res.status(200).json(series);
    } catch (error) {
        console.error("Error fetching Series:", error);
        res.status(500).json(error);
    }
};

// 3. Search Series
export const searchSeries = async (req, res) => {
    const query = req.query.q || ''; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const categoryFilter = req.query.category; 
    const yearFilter = req.query.year; 
    const genreFilter = req.query.genre; 

    try {
        let dbQuery = { title: { $regex: query, $options: 'i' } };
        
        if (categoryFilter) dbQuery.category = categoryFilter;
        if (yearFilter) dbQuery.year = parseInt(yearFilter);
        if (genreFilter) dbQuery.genres = { $regex: genreFilter, $options: 'i' };

        const series = await Series.find(dbQuery)
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit);

        res.status(200).json(series);
    } catch (error) {
        console.error("Error searching Series:", error);
        res.status(500).json(error);
    }
};

// 4. Get By ID
export const getSeriesById = async (req, res) => {
    try {
        const series = await Series.findById(req.params.id);
        if (!series) return res.status(404).json({ message: "Series not found" });
        
        res.status(200).json(series);
    } catch (error) {
        res.status(500).json(error);
    }
};

// 5. Update Series Details
export const updateSeries = async (req, res) => {
    try {
        const { title, posterUrl, imdbId, tmdbId, customUrl, year, language, category, genres, rating, isHero } = req.body;
        
        const updatedSeries = await Series.findByIdAndUpdate(
            req.params.id,
            { title, posterUrl, imdbId, tmdbId, customUrl, year, language, category, genres, rating, isHero },
            { new: true } 
        );

        if (!updatedSeries) {
            return res.status(404).json({ message: "Series not found" });
        }
        
        res.status(200).json({ message: "Series updated successfully!", updatedSeries });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Series update karne mein masla aagaya" });
    }
};

// 6. Delete Series Permanently
export const deleteSeries = async (req, res) => {
    try {
        const deletedSeries = await Series.findByIdAndDelete(req.params.id);
        if (!deletedSeries) return res.status(404).json({ message: "Series not found" });
        
        res.status(200).json({ message: "Series successfully deleted!" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Series delete karne mein masla aagaya" });
    }
};

// 7. Get Hero Series
export const getHeroSeries = async (req, res) => {
    try {
        const heroSeries = await Series.find({ isHero: true }).sort({ createdAt: -1 }).limit(5);
        res.status(200).json(heroSeries);
    } catch (error) {
        console.error("Hero series fetch error:", error);
        res.status(500).json(error);
    }
};