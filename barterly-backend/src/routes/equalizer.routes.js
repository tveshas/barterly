import express from "express";
import * as equalizerController from "../controllers/equalizer.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { calculateEqualizationSchema } from "../validations/equalizer.validation.js";
import { equalizerLimiter } from "../config/rateLimiter.js";

const router = express.Router();

router.use(authenticate);

/**
 * @route   POST /api/equalizer/calculate
 * @desc    AI-moderated fair-trade proposal between two skills
 * @access  Private
 */
router.post(
  "/calculate",
  equalizerLimiter,
  validate(calculateEqualizationSchema),
  equalizerController.calculate,
);

export default router;
