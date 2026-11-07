import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import movieRoutes from "./routes/movieRoutes.js";
import seriesRoute from './routes/seriesRoute.js';
import authRoutes from './routes/authRoutes.js';
import requestRoute from './routes/requestRoute.js'

const app = express();
const port = process.env.PORT || 5000;
// === 🔥 MERI GHALTI KA FIX (CORS POLICY) ===
// 'origin: "*"' lagane se ab Vercel ka koi bhi link block nahi hoga!
app.use(cors());

app.use(express.json());

// Database Connect (Simple tareeka)
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/movies", movieRoutes);
app.use('/api/series', seriesRoute);
app.use('/api/requests', requestRoute);

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    // 1. Check if MongoDB is connected
    const dbStatus = mongoose.connection.readyState; 
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    if (dbStatus === 1) {
      // 2. Perform a tiny query to keep DB active
      // 'User' ki jagah apni kisi bhi collection ka model name likhein
      // Ye sirf 1 record check karega taake connection refresh ho
      await mongoose.connection.db.admin().ping(); 

      return res.status(200).json({
        status: 'active',
        database: 'connected',
        message: 'Backend is awake and DB is fresh!'
      });
    } else {
      throw new Error('Database not connected');
    }
  } catch (error) {
    console.error('Health Check Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
app.get('/ping', (req, res) => {
    res.send("ok");
});

// Backend ke main file mein
app.get('/api/keep-alive', (req, res) => {
    res.status(200).send("Backend is awake!");
});

app.get("/", (req, res) => {
  res.send("Movie API is Running Successfully! ");
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});

// Vercel Export
export default app;