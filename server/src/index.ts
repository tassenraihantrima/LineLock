import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

// Load environment variables from a future .env file.
dotenv.config();

// Create the Express application for API routes.
const app = express();

// Wrap Express inside an HTTP server.
// Socket.IO will use this same server for real-time connections.
const httpServer = createServer(app);

// Use the deployment port when available, otherwise use port 3001 locally.
const PORT = Number(process.env.PORT) || 3001;

// Allow the Vite frontend to communicate with the backend.
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

// Allow Express to read JSON request bodies.
app.use(express.json());

// Create the Socket.IO server for future multiplayer communication.
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Basic route used to confirm that the backend is running.
app.get("/", (_request, response) => {
  response.json({
    message: "LineLock server is running.",
  });
});

// Health-check route for local testing and future deployment services.
app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    application: "LineLock",
  });
});

// Listen for a browser connecting through Socket.IO.
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Run when that browser disconnects.
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Print a clear error if the server cannot start.
httpServer.on("error", (error) => {
  console.error("Failed to start the LineLock server:", error);
});

// Start the Express and Socket.IO server.
httpServer.listen(PORT, () => {
  console.log(`LineLock server is running at http://localhost:${PORT}`);
});