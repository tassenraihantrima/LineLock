import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import {
  Server,
  type Socket,
} from "socket.io";

// Load values from a future server .env file.
dotenv.config({
  quiet: true,
});

// Identify the two positions available inside a room.
type OnlinePlayerNumber = 1 | 2;

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

// Describe one player stored inside a room.
type OnlineRoomPlayer = {
  socketId: string;
  name: string;
  playerNumber: OnlinePlayerNumber;
};

// Describe the public room state sent to browsers.
type OnlineRoom = {
  roomCode: string;
  status: "waiting" | "ready";
  players: OnlineRoomPlayer[];
};

// Describe the information required to create a room.
type CreateRoomPayload = {
  playerName: string;
};

// Describe the information required to join a room.
type JoinRoomPayload = {
  roomCode: string;
  playerName: string;
};

// Return either the current room or a readable validation error.
type RoomActionResponse =
  | {
    success: true;
    room: OnlineRoom;
  }
  | {
    success: false;
    message: string;
  };

// Store each room inside the server process.
type RoomRecord = {
  roomCode: string;
  players: OnlineRoomPlayer[];
};

// Events the server sends to connected clients.
interface ServerToClientEvents {
  "server:connection-ready": (
    payload: ConnectionReadyPayload,
  ) => void;

  "server:pong": (
    payload: PongPayload,
  ) => void;

  "room:updated": (
    room: OnlineRoom,
  ) => void;
}

// Events the server receives from connected clients.
interface ClientToServerEvents {
  "client:ping": (
    payload: PingPayload,
  ) => void;

  "room:create": (
    payload: CreateRoomPayload,
    callback: (response: RoomActionResponse) => void,
  ) => void;

  "room:join": (
    payload: JoinRoomPayload,
    callback: (response: RoomActionResponse) => void,
  ) => void;

  "room:leave": (
    callback: (response: RoomActionResponse) => void,
  ) => void;
}

// No inter-server events are required during local development.
interface InterServerEvents { }

// Store room membership directly on each connected socket.
interface SocketData {
  roomCode?: string;
  playerName?: string;
  playerNumber?: OnlinePlayerNumber;
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

// Store active rooms in memory.
//
// Restarting the server clears these rooms. Persistent rooms and
// database storage are intentionally outside Phase 11.
const rooms = new Map<string, RoomRecord>();

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
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: allowedClientOrigins,
    methods: ["GET", "POST"],
  },
});

// Remove surrounding whitespace and limit room names to 20 characters.
function cleanPlayerName(playerName: string): string {
  const cleanedName = playerName.trim().slice(0, 20);

  return cleanedName || "Player";
}

// Normalize room codes before searching the room map.
function cleanRoomCode(roomCode: string): string {
  return roomCode.trim().toUpperCase();
}

// Generate a readable six-character room code.
//
// Characters that are easily confused, such as O and 0, are excluded.
function generateRoomCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let roomCode = "";

  do {
    roomCode = Array.from(
      { length: 6 },
      () =>
        characters[
        Math.floor(Math.random() * characters.length)
        ],
    ).join("");
  } while (rooms.has(roomCode));

  return roomCode;
}

// Convert the internal room record into the public room structure.
function createRoomSummary(room: RoomRecord): OnlineRoom {
  return {
    roomCode: room.roomCode,
    status:
      room.players.length === 2
        ? "ready"
        : "waiting",
    players: room.players.map((player) => ({
      ...player,
    })),
  };
}

// Send the newest room state to every connected room member.
function broadcastRoomUpdate(room: RoomRecord): void {
  io.to(room.roomCode).emit(
    "room:updated",
    createRoomSummary(room),
  );
}

// Remove a socket from its current room and update remaining members.
function removeSocketFromRoom(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
): OnlineRoom | null {
  const roomCode = socket.data.roomCode;

  if (!roomCode) {
    return null;
  }

  const room = rooms.get(roomCode);

  // Clear socket membership even if the room no longer exists.
  socket.leave(roomCode);
  socket.data.roomCode = undefined;
  socket.data.playerName = undefined;
  socket.data.playerNumber = undefined;

  if (!room) {
    return null;
  }

  // Remove the leaving socket from the room's player list.
  room.players = room.players.filter(
    (player) => player.socketId !== socket.id,
  );

  // Delete completely empty rooms.
  if (room.players.length === 0) {
    rooms.delete(roomCode);

    console.log(`Room deleted: ${roomCode}`);

    return {
      roomCode,
      status: "waiting",
      players: [],
    };
  }

  // The remaining player becomes Player 1.
  room.players = room.players.map((player, index) => ({
    ...player,
    playerNumber: (index + 1) as OnlinePlayerNumber,
  }));

  broadcastRoomUpdate(room);

  return createRoomSummary(room);
}

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
    activeRooms: rooms.size,
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

  // Create a new room and make the requesting socket Player 1.
  socket.on(
    "room:create",
    (payload, callback) => {
      // Leave any previous room before creating a new one.
      removeSocketFromRoom(socket);

      const playerName = cleanPlayerName(
        payload.playerName,
      );

      const roomCode = generateRoomCode();

      const room: RoomRecord = {
        roomCode,
        players: [
          {
            socketId: socket.id,
            name: playerName,
            playerNumber: 1,
          },
        ],
      };

      rooms.set(roomCode, room);

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.playerName = playerName;
      socket.data.playerNumber = 1;

      const roomSummary = createRoomSummary(room);

      console.log(
        `${playerName} created room ${roomCode}`,
      );

      callback({
        success: true,
        room: roomSummary,
      });

      broadcastRoomUpdate(room);
    },
  );

  // Join an existing room as Player 2.
  socket.on(
    "room:join",
    (payload, callback) => {
      const roomCode = cleanRoomCode(
        payload.roomCode,
      );

      const playerName = cleanPlayerName(
        payload.playerName,
      );

      const room = rooms.get(roomCode);

      if (!room) {
        callback({
          success: false,
          message:
            "No active room was found with that code.",
        });

        return;
      }

      if (room.players.length >= 2) {
        callback({
          success: false,
          message:
            "That room already has two players.",
        });

        return;
      }

      // Leave a different room before joining this one.
      removeSocketFromRoom(socket);

      const roomPlayer: OnlineRoomPlayer = {
        socketId: socket.id,
        name: playerName,
        playerNumber: 2,
      };

      room.players.push(roomPlayer);

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.playerName = playerName;
      socket.data.playerNumber = 2;

      const roomSummary = createRoomSummary(room);

      console.log(
        `${playerName} joined room ${roomCode}`,
      );

      callback({
        success: true,
        room: roomSummary,
      });

      broadcastRoomUpdate(room);
    },
  );

  // Allow the current socket to leave its room manually.
  socket.on("room:leave", (callback) => {
    const previousRoomCode = socket.data.roomCode;

    if (!previousRoomCode) {
      callback({
        success: false,
        message:
          "This player is not currently inside a room.",
      });

      return;
    }

    const updatedRoom =
      removeSocketFromRoom(socket);

    console.log(
      `Player ${socket.id} left room ${previousRoomCode}`,
    );

    callback({
      success: true,
      room:
        updatedRoom ?? {
          roomCode: previousRoomCode,
          status: "waiting",
          players: [],
        },
    });
  });

  // Remove disconnected players from the in-memory room state.
  socket.on("disconnect", (reason) => {
    const previousRoomCode = socket.data.roomCode;

    removeSocketFromRoom(socket);

    if (previousRoomCode) {
      console.log(
        `Player ${socket.id} disconnected from room ${previousRoomCode}. Reason: ${reason}`,
      );
    } else {
      console.log(
        `Player disconnected: ${socket.id}. Reason: ${reason}`,
      );
    }
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