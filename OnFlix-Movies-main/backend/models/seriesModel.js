import mongoose from "mongoose";

const seriesSchema = new mongoose.Schema(
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
    tmdbId: {
      type: String,
      default: "",
    },
    // 🔥 Sirf 1 URL Field, kyunke Piexe khud episodes handle kar raha hai
    customUrl: {
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
      default: "Web Series", // Default category change kar di hai
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
seriesSchema.index({ title: "text" }, { language_override: "none" });
console.log("Series Schema with Indexing Created");

export default mongoose.model("Series", seriesSchema);