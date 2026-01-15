import { config } from "./index.js";

const allowedOrigins = [
  config.clientUrl, // e.g. http://localhost:5173
  "http://localhost:5173", // hard fallback for local dev
];

export const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser clients (Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
};
