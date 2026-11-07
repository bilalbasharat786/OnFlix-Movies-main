import express from 'express';
import { 
    addSeries, 
    getSeries, 
    searchSeries, 
    getSeriesById, 
    updateSeries, 
    deleteSeries, 
    getHeroSeries 
} from '../controllers/seriesController.js';

const router = express.Router();

router.post('/add', addSeries);
router.get('/all', getSeries);
router.get('/search', searchSeries);
router.get('/hero', getHeroSeries);
router.get('/:id', getSeriesById);
router.put('/:id', updateSeries);
router.delete('/:id', deleteSeries);

export default router;