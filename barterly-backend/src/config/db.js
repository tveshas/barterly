import mongoose from "mongoose";

const isPlaceholderMongoUri = (uri) => {
  if (!uri) return true;

  try {
    const parsed = new URL(uri);
    const host = parsed.hostname.toLowerCase();

    return host === "cluster.mongodb.net" || host.includes("<") || host.includes(">");
  } catch {
    return false;
  }
};

const isServerless = !!process.env.VERCEL;
let connecting = null;
let listenersAttached = false;

/**
 * Connect to MongoDB. Idempotent and safe to call on every request:
 * reuses an open connection (important on serverless warm invocations).
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      if (isPlaceholderMongoUri(process.env.MONGODB_URI)) {
        throw new Error(
          "MONGODB_URI is missing or still uses the placeholder Atlas host. Replace it with the full connection string from MongoDB Atlas, including your real cluster hostname."
        );
      }

      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        ...(isServerless ? { maxPoolSize: 5 } : {}),
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      if (!listenersAttached) {
        listenersAttached = true;
        mongoose.connection.on("error", (err) => {
          console.error("❌ MongoDB connection error:", err);
        });
        mongoose.connection.on("disconnected", () => {
          console.warn("⚠️  MongoDB disconnected");
        });
        if (!isServerless) {
          process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed due to app termination");
            process.exit(0);
          });
        }
      }
      return conn.connection;
    } catch (error) {
      connecting = null;
      console.error("❌ MongoDB connection failed:", error.message);
      if (isServerless) throw error;
      process.exit(1);
    }
  })();

  return connecting;
};

export default connectDB;
