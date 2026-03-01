import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGO_URI/MONGODB_URI not set!");
      return false;
    }
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    // Don't exit on Vercel - let it retry
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    return false;
  }
};

export default connectDB;
