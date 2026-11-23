import dotenv from "dotenv";

// Load environment variables FIRST (before other imports)
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/config/socket.js";

import { registeredUsers } from "./src/config/metrics.js";
import User from './src/models/User.model.js';




// Start server
const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize Socket.io on the generic active HTTP server wrapper
initializeSocket(httpServer);

const startServer = async () => {
  await connectDB();

  const userCount = await User.countDocuments();
  registeredUsers.set(userCount);

  const server = httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });

  // keep your existing error handlers inside so server is in scope
  process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Promise Rejection:", err);
    server.close(() => process.exit(1));
  });

  process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
  });
};

startServer();