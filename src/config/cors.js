import { config } from "./index.js";

export const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === config.clientUrl) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
};
