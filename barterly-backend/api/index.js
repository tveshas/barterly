// Vercel serverless entrypoint: wraps the Express app.
// (Long-lived features like Socket.io don't run here; chat falls back to polling.)
import app from "../src/app.js";
import connectDB from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({ success: false, message: "Database unavailable. Please try again." }),
    );
  }
  return app(req, res);
}
