import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  googleLoginSchema,
  devLoginSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

// Sign in / sign up with Google (the only way to authenticate)
router.post("/google", validate(googleLoginSchema), authController.googleLogin);

// Test login for seeded users. Local dev: enabled by DEV_LOGIN=true.
// Production: additionally requires DEV_LOGIN_KEY (and only reaches seeded test users).
if (
  process.env.DEV_LOGIN === "true" &&
  (process.env.NODE_ENV !== "production" || process.env.DEV_LOGIN_KEY)
) {
  router.post("/dev-login", validate(devLoginSchema), authController.devLogin);
}

// Refresh access token
router.post("/refresh-token", authController.refreshToken);

// Get current user
router.get("/me", authenticate, authController.getCurrentUser);

// Logout user
router.post("/logout", authenticate, authController.logout);

export default router;
