import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

// Load values from a future server .env file.
dotenv.config({
  quiet: true,
});

// Describe the data sent when the server accepts a connection.
type ConnectionReadyPayload = {
  socketId: string;
  message: string;
  connectedAt: string;
};

// Describe the timestamp received from the browser.
type PingPayload = {
  sentAt: number;
};

// Describe the timestamps returned to the browser.
type PongPayload = {
  sentAt: number;
  receivedAt: number;
};

// Events the server sends to connected clients.
interface ServerToClientEvents {
  "server:connection-ready": (
    payload: ConnectionReadyPayload,
  ) => void;

  "server:pong": (
    payload: PongPayload,
  ) => void;
}

// Events the server receives from connected clients.
interface ClientToServerEvents {
  "client:ping": (
    payload: PingPayload,
  ) => void;
}

// Create the Express application used for normal HTTP routes.
const app = express();

// Create one HTTP server shared by Express and Socket.IO.
const httpServer = createServer(app);

// Use a deployment port when available.
// Otherwise, use port 3001 during local development.
const PORT = Number(process.env.PORT) || 3001;

// Accept requests from either common Vite development address.
const allowedClientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Allow the React application to access Express routes.
app.use(
  cors({
    origin: allowedClientOrigins,
  }),
);

// Allow Express to read JSON request bodies.
app.use(express.json());

// Create a typed Socket.IO server using the same HTTP server.
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(httpServer, {
  cors: {
    origin: allowedClientOrigins,
    methods: ["GET", "POST"],
  },
});

// Confirm that the regular Express server is running.
app.get("/", (_request, response) => {
  response.json({
    message: "LineLock server is running.",
  });
});

// Provide a health route for local testing and future deployment.
app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    application: "LineLock",
    realtime: "Socket.IO",
  });
});

// Run whenever a browser establishes a Socket.IO connection.
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Immediately confirm the connection to the browser.
  socket.emit("server:connection-ready", {
    socketId: socket.id,
    message:
      "The LineLock client is connected to the real-time server.",
    connectedAt: new Date().toISOString(),
  });

  // Respond whenever the client sends a latency test.
  socket.on("client:ping", (payload) => {
    socket.emit("server:pong", {
      sentAt: payload.sentAt,
      receivedAt: Date.now(),
    });
  });

  // Log when this browser leaves or closes the connection.
  socket.on("disconnect", (reason) => {
    console.log(
      `Player disconnected: ${socket.id}. Reason: ${reason}`,
    );
  });
});

// Log server-level connection errors for easier debugging.
io.engine.on("connection_error", (error) => {
  console.error(
    `Socket.IO connection error: ${error.message}`,
  );
});

// Start Express and Socket.IO on the local loopback address.
httpServer.listen(PORT, "127.0.0.1", () => {
  console.log(
    `LineLock server is running at http://127.0.0.1:${PORT}`,
  );
});