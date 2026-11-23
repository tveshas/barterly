import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.model.js";
import {
  generateTokens,
  blacklistToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.utils.js";
import { AppError } from "../utils/apiResponse.utils.js";
import { registeredUsers } from "../config/metrics.js";
import { recordSignupBonus } from "./wallet.service.js";

let googleClient;
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google sign-in is not configured on the server", 503);
  }
  googleClient ??= new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return googleClient;
};

const adminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * Sign in (or sign up) with a Google ID token from Google Identity Services.
 * Existing accounts with the same email are linked automatically.
 */
export const googleLogin = async (idToken, options = {}) => {
  let payload;
  try {
    const ticket = await getGoogleClient().verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Invalid Google credential", 401);
  }

  if (!payload?.email || !payload.email_verified) {
    throw new AppError("Your Google email address is not verified", 401);
  }

  const email = payload.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: (payload.name || email.split("@")[0]).trim().slice(0, 50).padEnd(2, "_"),
      email,
      googleId: payload.sub,
      isVerified: true,
      role: adminEmails().includes(email) ? "admin" : "user",
      avatar: { url: payload.picture || "", public_id: "" },
    });
    await recordSignupBonus(user._id);
    registeredUsers.inc();
  } else {
    if (!user.isActive) {
      throw new AppError(
        "Your account has been deactivated. Please contact support.",
        403,
      );
    }
    let changed = false;
    if (!user.googleId) { user.googleId = payload.sub; changed = true; }
    if (!user.isVerified) { user.isVerified = true; changed = true; }
    if (!user.avatar?.url && payload.picture) {
      user.avatar = { url: payload.picture, public_id: "" };
      changed = true;
    }
    if (adminEmails().includes(email) && user.role !== "admin") {
      user.role = "admin";
      changed = true;
    }
    if (changed) await user.save();
  }

  return {
    user: user.toPublicProfile(),
    ...generateTokens(user, { refreshExpiresIn: options.refreshExpiresIn }),
  };
};

/**
 * Test login: sign in as a seeded user by email, no Google needed.
 *  - Local dev (NODE_ENV != production): any existing user.
 *  - Production: only if the operator opted in with DEV_LOGIN=true AND set
 *    DEV_LOGIN_KEY; the caller must send that key and the target must be a
 *    seeded test user (isTestUser). Real users and admins can never be reached.
 */
export const devLogin = async (email, key, options = {}) => {
  const production = process.env.NODE_ENV === "production";
  if (production) {
    const expected = process.env.DEV_LOGIN_KEY || "";
    const given = String(key || "");
    const ok =
      expected.length >= 8 &&
      given.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
    if (!ok) throw new AppError("Invalid test login key", 401);
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !user.isActive || (production && !user.isTestUser)) {
    throw new AppError("Test user not found", 404);
  }
  return {
    user: user.toPublicProfile(),
    ...generateTokens(user, { refreshExpiresIn: options.refreshExpiresIn }),
  };
};

export const refreshAccessToken = async (refreshToken, options = {}) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new AppError("User not found", 404);
  if (!user.isActive) throw new AppError("Account deactivated", 403);

  return generateTokens(user, { refreshExpiresIn: options.refreshExpiresIn });
};

export const logoutUser = async (accessToken) => {
  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      const ttlSeconds = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttlSeconds > 0) await blacklistToken(decoded.jti, ttlSeconds);
    } catch (_) {}
  }
  return { message: "Logged out successfully" };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return { user: user.toPublicProfile() };
};
