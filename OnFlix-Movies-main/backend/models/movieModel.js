import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    imdbId: {
      type: String,
      required: true,
    },
    // 🔥 NAYI FIELD: TMDB ID
    tmdbId: {
      type: String,
      default: "",
    },
    customUrl: {
      type: String,
      default: "",
    },
    // 🔥 NAYI FIELD: Server 2 (Piexe) URL
    customUrl2: {
      type: String,
      default: "",
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    language: {
      type: String,
      default: "Hindi",
    },
    category: {
      type: String,
      default: "Bollywood",
    },
    genres: { type: String, default: "" },
    rating: { type: String, default: "" },
    isHero: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true },
);

// === PERFORMANCE BOOSTER ===
movieSchema.index({ title: "text" }, { language_override: "none" });
console.log("Movie Schema with Indexing Created");

export default mongoose.model("Movie", movieSchema);
