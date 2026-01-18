import cors from "cors";

export const corsOptions = {
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true, // CRITICAL: Allow cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

export default cors(corsOptions);
