import mongoose from "mongoose";
import { config } from "./index.js";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  console.log("Connecting to MongoDB...");

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });

    isConnected = true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

/* ========= Connection Event Logging ========= */

mongoose.connection.once("connected", () => {
  console.log("MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});
