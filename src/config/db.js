import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed");
    process.exit(1);
  }
};
