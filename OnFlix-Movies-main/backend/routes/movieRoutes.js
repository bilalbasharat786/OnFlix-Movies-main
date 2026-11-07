import express from 'express';
import { 
    addMovie, getMovies, searchMovies, getMovieById, 
    updateMovie, deleteMovie, getHeroMovies, getDirectStream 
} from '../controllers/movieController.js';

const router = express.Router();

console.log("Routes Loaded...");

router.post('/add', addMovie);
router.get('/all', getMovies);
router.get('/search', searchMovies);
router.get('/hero', getHeroMovies);

// 🔥 Naya route yahan add kiya hai (/:id se pehle)
router.get('/stream/:id', getDirectStream);

router.get('/:id', getMovieById);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

export default router;