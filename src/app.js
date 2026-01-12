import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import adminPropertyRoutes from "./routes/admin.property.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

import {
  apiLimiter,
  securityMiddleware,
} from "./middlewares/security.middleware.js";

import { corsOptions } from "./config/cors.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

export const app = express();

/* =========================
   CORE BODY PARSERS
   ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   SECURITY (GLOBAL)
   ========================= */
securityMiddleware.forEach((mw) => app.use(mw));
app.use("/api", apiLimiter);

/* =========================
   CORS (SINGLE SOURCE OF TRUTH)
   ========================= */
app.use(cors(corsOptions));

/* =========================
   LOGGER
   ========================= */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
/* API Docs */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================
   ROUTES
   ========================= */
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminPropertyRoutes);

app.use("/api/properties", propertyRoutes);
app.use("/api/enquiries", enquiryRoutes);

/* =========================
   404 HANDLER
   ========================= */
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* =========================
   GLOBAL ERROR HANDLER (LAST)
   ========================= */
app.use(globalErrorHandler);
