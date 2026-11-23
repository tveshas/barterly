import * as authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.utils.js";

const isProduction = process.env.NODE_ENV === "production";

const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRE || "7d";
const REMEMBER_ME_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_REMEMBER_EXPIRE || "30d";
const DEFAULT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const parseDurationToMs = (value, fallbackMs) => {
  if (typeof value !== "string") {
    return fallbackMs;
  }

  const parsed = value.trim().match(/^(\d+)\s*([smhd])$/i);

  if (!parsed) {
    return fallbackMs;
  }

  const amount = Number(parsed[1]);
  const unit = parsed[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const buildRefreshCookieOptions = (maxAge) => {
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    path: "/",
  };

  if (typeof maxAge === "number") {
    options.maxAge = maxAge;
  }

  return options;
};

const startSession = (res, result, remember) => {
  const refreshExpiresIn = remember
    ? REMEMBER_ME_REFRESH_EXPIRES_IN
    : REFRESH_EXPIRES_IN;
  const refreshMaxAge = parseDurationToMs(
    refreshExpiresIn,
    DEFAULT_REFRESH_MAX_AGE_MS,
  );
  res.cookie(
    "refreshToken",
    result.refreshToken,
    buildRefreshCookieOptions(remember ? refreshMaxAge : undefined),
  );
  return { user: result.user, accessToken: result.accessToken };
};

const refreshExpiryFor = (remember) =>
  remember ? REMEMBER_ME_REFRESH_EXPIRES_IN : REFRESH_EXPIRES_IN;

export const googleLogin = async (req, res, next) => {
  try {
    const { credential, rememberMe } = req.body;
    const remember = rememberMe !== false; // stay signed in by default
    const result = await authService.googleLogin(credential, {
      refreshExpiresIn: refreshExpiryFor(remember),
    });
    return successResponse(
      res,
      200,
      "Login successful",
      startSession(res, result, remember),
    );
  } catch (error) {
    next(error);
  }
};

export const devLogin = async (req, res, next) => {
  try {
    const result = await authService.devLogin(req.body.email, req.body.key, {
      refreshExpiresIn: refreshExpiryFor(true),
    });
    return successResponse(
      res,
      200,
      "Dev login successful",
      startSession(res, result, true),
    );
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { rememberMe } = req.body || {};

    const debugAuth = process.env.DEBUG_AUTH === "true";
    const remember = !!rememberMe;

    const refreshExpiresIn = remember
      ? REMEMBER_ME_REFRESH_EXPIRES_IN
      : REFRESH_EXPIRES_IN;

    const tokens = await authService.refreshAccessToken(refreshToken, {
      refreshExpiresIn,
    });

    const refreshMaxAge = parseDurationToMs(
      refreshExpiresIn,
      DEFAULT_REFRESH_MAX_AGE_MS,
    );

    // RememberMe ON -> persistent cookie, OFF -> session cookie
    const cookieOptions = buildRefreshCookieOptions(remember ? refreshMaxAge : undefined);
    res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

    if (debugAuth) {
      console.log("[auth.refreshToken]", {
        rememberMe,
        rememberMeType: typeof rememberMe,
        refreshExpiresIn,
        cookieHasMaxAge: typeof cookieOptions.maxAge === "number",
      });
    }

    return successResponse(res, 200, "Token refreshed successfully", {
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    await authService.logoutUser(token);

    // Clear refresh token cookie
    res.clearCookie("refreshToken", buildRefreshCookieOptions());

    return successResponse(res, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await authService.getCurrentUser(userId);

    return successResponse(
      res,
      200,
      "User profile retrieved successfully",
      result,
    );
  } catch (error) {
    next(error);
  }
};
