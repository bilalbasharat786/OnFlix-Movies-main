import mongoose from "mongoose";

const connectDB = async () => {
  // === VERCEL SERVERLESS MAGIC LINE (Jo pichli baar reh gayi thi) ===
  if (mongoose.connection.readyState >= 1) {
    console.log("Database Pehle Se Connected Hai (Cached) ⚡");
    return;
  }

  try {
    // Agar connection nahi hai, tabhi naya connection banao
    await mongoose.connect(`${process.env.MONGO_URI}/movies`, {
      serverSelectionTimeoutMS: 5000, // 5 second se zyada wait na kare
      maxPoolSize: 10, // Vercel ko overload hone se bachaye
    });
    console.log("Movie Database Connected Successfully 🚀");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

export default connectDB;