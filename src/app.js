import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import propertyRoutes from "./routes/property.routes.js";

export const app = express();

/* =========================
   CORE MIDDLEWARE (FIRST)
   ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   CORS
   ========================= */
app.use(
  cors({
    origin: true, // replace with frontend URL later
    credentials: true,
  })
);

/* =========================
   LOGGER
   ========================= */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* =========================
   ROUTES (AFTER MIDDLEWARE)
   ========================= */
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/properties", propertyRoutes);

/* =========================
   404 HANDLER (OPTIONAL BUT RECOMMENDED)
   ========================= */
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});
