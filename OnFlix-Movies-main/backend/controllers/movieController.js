import Movie from '../models/movieModel.js'; 
import axios from 'axios';
import * as cheerio from 'cheerio';

// 1. Add Movie
export const addMovie = async (req, res) => {
    try {
        console.log("Request received to ADD movie:", req.body.title);
        // req.body mein ab tmdbId aur customUrl2 automatically shamil honge
        const newMovie = new Movie(req.body);
        const savedMovie = await newMovie.save();
        console.log("Movie Saved Successfully:", savedMovie._id);
        res.status(201).json(savedMovie);
    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json(error);
    }
};

// 2. Get All Movies (with Pagination, CATEGORY & GENRE Filter)
export const getMovies = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const categoryFilter = req.query.category; 
    const yearFilter = req.query.year; 
    const genreFilter = req.query.genre; 

    try {
        let query = {};
        if (categoryFilter) {
            query.category = categoryFilter; 
        }
        if (yearFilter) {
            query.year = parseInt(yearFilter);
        }
        if (genreFilter) {
            query.genres = { $regex: genreFilter, $options: 'i' }; 
        }

        const movies = await Movie.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        res.status(200).json(movies);
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json(error);
    }
};

// 3. Search Movie (with CATEGORY & GENRE Filter)
export const searchMovies = async (req, res) => {
    const query = req.query.q || ''; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const categoryFilter = req.query.category; 
    const yearFilter = req.query.year; 
    const genreFilter = req.query.genre; 

    try {
        let dbQuery = { title: { $regex: query, $options: 'i' } };
        
        if (categoryFilter) {
            dbQuery.category = categoryFilter;
        }
        if (yearFilter) {
            dbQuery.year = parseInt(yearFilter);
        }
        if (genreFilter) {
            dbQuery.genres = { $regex: genreFilter, $options: 'i' };
        }

        const movies = await Movie.find(dbQuery)
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit);

        res.status(200).json(movies);
    } catch (error) {
        console.error("Error searching movie:", error);
        res.status(500).json(error);
    }
};

// 4. Get By ID
export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json(error);
    }
};

// 5. Update Movie Details (🔥 BUG FIX: Added tmdbId and customUrl2)
export const updateMovie = async (req, res) => {
    try {
        // 🔥 Yahan Destructuring mein tmdbId aur customUrl2 add kiye hain
        const { title, posterUrl, imdbId, tmdbId, customUrl, customUrl2, year, language, category, genres, rating, isHero } = req.body;
        
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            // 🔥 Nayi fields ko update statement mein pass kiya
            { title, posterUrl, imdbId, tmdbId, customUrl, customUrl2, year, language, category, genres, rating, isHero },
            { new: true } 
        );

        if (!updatedMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        
        res.status(200).json({ message: "Movie updated successfully!", updatedMovie });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Movie update karne mein masla aagaya" });
    }
};

// 6. Delete Movie Permanently
export const deleteMovie = async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        
        if (!deletedMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        
        res.status(200).json({ message: "Movie successfully deleted!" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Movie delete karne mein masla aagaya" });
    }
};

// 7. Get Hero Movies
export const getHeroMovies = async (req, res) => {
    try {
        const heroMovies = await Movie.find({ isHero: true }).sort({ createdAt: -1 }).limit(5);
        res.status(200).json(heroMovies);
    } catch (error) {
        console.error("Hero movies fetch error:", error);
        res.status(500).json(error);
    }
};

// 8. Extract Direct Stream Link (Aap isay future mein hata bhi sakte hain kyunke ab seedha iframe use ho raha hai)
export const getDirectStream = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: "Movie not found" });

        if (!movie.customUrl) {
            return res.status(200).json({ 
                directUrl: `https://vsembed.ru/embed/movie/${movie.imdbId}`, 
                isEmbed: true 
            });
        }

        const watchUrl = movie.customUrl;
        const shortcutUrl = watchUrl.replace('/watch/', '/');

        try {
            console.log(`Scraping link: ${watchUrl}`);
            const { data } = await axios.get(watchUrl);
            const $ = cheerio.load(data);
            const videoSrc = $('video source').attr('src') || $('video').attr('src');

            if (videoSrc) {
                const directUrl = new URL(videoSrc, watchUrl).href;
                return res.status(200).json({ directUrl, isEmbed: false });
            }
        } catch (scrapeError) {
            console.log("Scraping block ho gayi, shortcut URL use kar rahay hain.");
        }

        return res.status(200).json({ directUrl: shortcutUrl, isEmbed: false });

    } catch (error) {
        console.error("Stream extract error:", error);
        res.status(500).json({ error: "Direct link nikalne mein masla aaya" });
    }
};