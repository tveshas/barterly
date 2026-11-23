import rateLimit from "express-rate-limit";
import { rateLimitKeyGenerator } from "../utils/ip.utils.js";

// In-memory stores (express-rate-limit default). Fine for a single server
// instance, which is how this app is deployed; no Redis needed.
// Limits are skipped outside production so local development isn't throttled.
const limiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator: rateLimitKeyGenerator,
    skip: () => process.env.NODE_ENV !== "production",
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

export const authLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many attempts. Please try again after 15 minutes",
});

export const apiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many attempts. Please slow down",
});

export const uploadLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: "Upload limit reached. Try again in an hour.",
});

// Each call hits the Groq API, so keep this tighter
export const equalizerLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: "Fair-trade calculator limit reached. Try again later.",
});
