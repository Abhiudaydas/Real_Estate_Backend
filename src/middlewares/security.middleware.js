import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

/* =========================
   RATE LIMITER
   ========================= */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================
   GLOBAL SECURITY MIDDLEWARE
   ========================= */
export const securityMiddleware = [helmet(), hpp()];
