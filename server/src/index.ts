import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import {
  Server,
  type Socket,
} from "socket.io";

// Load values from a future server .env file.
dotenv.config({
  quiet: true,
});

// Identify both online player positions.
type PlayerNumber = 1 | 2;

// Represent every possible edge direction.
type EdgeOrientation = "horizontal" | "vertical";

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

// Describe one server-controlled player.
type ServerPlayer = {
  number: PlayerNumber;
  name: string;
  score: number;
};

// Describe one server-controlled board edge.
type ServerEdge = {
  id: string;
  orientation: EdgeOrientation;
  row: number;
  column: number;
  claimedBy: PlayerNumber | null;
};

// Describe one server-controlled box.
type ServerBox = {
  id: string;
  row: number;
  column: number;
  claimedBy: PlayerNumber | null;
};

// Describe the complete authoritative online game state.
type ServerGameState = {
  boardSize: number;
  players: [ServerPlayer, ServerPlayer];
  edges: ServerEdge[];
  boxes: ServerBox[];
  currentPlayer: PlayerNumber;
  status: "playing";
  moveCount: number;
};

// Describe one player stored inside an online room.
type OnlineRoomPlayer = {
  socketId: string;
  name: string;
  playerNumber: PlayerNumber;
  isConnected: boolean;
};

// Store private recovery information that must never be
// included in the public room object sent to browsers.
type RoomPlayerRecord = OnlineRoomPlayer & {
  recoveryToken: string;
  disconnectTimer: ReturnType<typeof setTimeout> | null;
};

// Describe the public room sent to connected browsers.
type OnlineRoom = {
  roomCode: string;
  status:
  | "waiting"
  | "ready"
  | "playing"
  | "complete";
  players: OnlineRoomPlayer[];
  gameState: ServerGameState | null;
};

// Describe the server's internal room record.
type RoomRecord = {
  roomCode: string;
  players: RoomPlayerRecord[];
  gameState: ServerGameState | null;
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

// Identify a returning player after a temporary disconnect.
type RecoverRoomPayload = {
  roomCode: string;
  recoveryToken: string;
};

// Describe one requested online move.
type OnlineMovePayload = {
  edgeId: string;
};

// Return either the current room or a readable error.
type RoomActionResponse =
  | {
    success: true;
    room: OnlineRoom;
    recoveryToken?: string;
  }
  | {
    success: false;
    message: string;
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

  "game:updated": (
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

  "room:recover": (
    payload: RecoverRoomPayload,
    callback: (response: RoomActionResponse) => void,
  ) => void;

  "room:leave": (
    callback: (response: RoomActionResponse) => void,
  ) => void;

  "game:start": (
    callback: (response: RoomActionResponse) => void,
  ) => void;

  "game:move": (
    payload: OnlineMovePayload,
    callback: (response: RoomActionResponse) => void,
  ) => void;
}

// No communication between multiple server processes is required yet.
interface InterServerEvents { }

// Store room membership on each connected socket.
interface SocketData {
  roomCode?: string;
  playerName?: string;
  playerNumber?: PlayerNumber;
}

// Create the Express application.
const app = express();

// Allow Express and Socket.IO to share one HTTP server.
const httpServer = createServer(app);

// Use a deployment port when available.
const PORT = Number(process.env.PORT) || 3001;

// Keep disconnected players inside their room briefly so they
// have an opportunity to recover their position.
const RECONNECTION_GRACE_PERIOD_MS = 30_000;

// Accept both common Vite development addresses.
const allowedClientOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Store rooms inside the running server process.
const rooms = new Map<string, RoomRecord>();

// Allow the React application to access Express routes.
app.use(
  cors({
    origin: allowedClientOrigins,
  }),
);

// Allow Express to read JSON bodies.
app.use(express.json());

// Create the typed Socket.IO server.
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

// Remove extra whitespace and limit player names.
function cleanPlayerName(playerName: string): string {
  const cleanedName = playerName.trim().slice(0, 20);

  return cleanedName || "Player";
}

// Normalize room codes before searching.
function cleanRoomCode(roomCode: string): string {
  return roomCode.trim().toUpperCase();
}

// Create a private credential used to recover the same
// player position after a temporary disconnection.
function generateRecoveryToken(): string {
  return randomBytes(32).toString("hex");
}

// Generate a unique six-character room code.
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

// Generate every horizontal edge on the board.
function createHorizontalEdges(
  boardSize: number,
): ServerEdge[] {
  const edges: ServerEdge[] = [];

  for (let row = 0; row < boardSize; row += 1) {
    for (
      let column = 0;
      column < boardSize - 1;
      column += 1
    ) {
      edges.push({
        id: `horizontal-${row}-${column}`,
        orientation: "horizontal",
        row,
        column,
        claimedBy: null,
      });
    }
  }

  return edges;
}

// Generate every vertical edge on the board.
function createVerticalEdges(
  boardSize: number,
): ServerEdge[] {
  const edges: ServerEdge[] = [];

  for (
    let row = 0;
    row < boardSize - 1;
    row += 1
  ) {
    for (
      let column = 0;
      column < boardSize;
      column += 1
    ) {
      edges.push({
        id: `vertical-${row}-${column}`,
        orientation: "vertical",
        row,
        column,
        claimedBy: null,
      });
    }
  }

  return edges;
}

// Generate every possible box on the board.
function createBoxes(
  boardSize: number,
): ServerBox[] {
  const boxes: ServerBox[] = [];

  for (
    let row = 0;
    row < boardSize - 1;
    row += 1
  ) {
    for (
      let column = 0;
      column < boardSize - 1;
      column += 1
    ) {
      boxes.push({
        id: `box-${row}-${column}`,
        row,
        column,
        claimedBy: null,
      });
    }
  }

  return boxes;
}

// Create a new server-controlled five-by-five game.
function createServerGameState(
  playerOneName: string,
  playerTwoName: string,
): ServerGameState {
  const boardSize = 5;

  return {
    boardSize,
    players: [
      {
        number: 1,
        name: playerOneName,
        score: 0,
      },
      {
        number: 2,
        name: playerTwoName,
        score: 0,
      },
    ],
    edges: [
      ...createHorizontalEdges(boardSize),
      ...createVerticalEdges(boardSize),
    ],
    boxes: createBoxes(boardSize),
    currentPlayer: 1,
    status: "playing",
    moveCount: 0,
  };
}

// Find an edge using its orientation and coordinates.
function findEdge(
  edges: ServerEdge[],
  orientation: EdgeOrientation,
  row: number,
  column: number,
): ServerEdge | undefined {
  return edges.find(
    (edge) =>
      edge.orientation === orientation &&
      edge.row === row &&
      edge.column === column,
  );
}

// Determine whether one box has four claimed edges.
function isBoxComplete(
  box: ServerBox,
  edges: ServerEdge[],
): boolean {
  const topEdge = findEdge(
    edges,
    "horizontal",
    box.row,
    box.column,
  );

  const bottomEdge = findEdge(
    edges,
    "horizontal",
    box.row + 1,
    box.column,
  );

  const leftEdge = findEdge(
    edges,
    "vertical",
    box.row,
    box.column,
  );

  const rightEdge = findEdge(
    edges,
    "vertical",
    box.row,
    box.column + 1,
  );

  return (
    topEdge?.claimedBy !== null &&
    bottomEdge?.claimedBy !== null &&
    leftEdge?.claimedBy !== null &&
    rightEdge?.claimedBy !== null
  );
}

// Determine whether every stored room player currently has
// an active Socket.IO connection.
function areAllRoomPlayersConnected(
  room: RoomRecord,
): boolean {
  return (
    room.players.length === 2 &&
    room.players.every((player) => player.isConnected)
  );
}

// Return the player who should act after a normal move.
function getOtherPlayer(
  currentPlayer: PlayerNumber,
): PlayerNumber {
  return currentPlayer === 1 ? 2 : 1;
}

// Determine whether every online edge has been claimed.
function isServerGameComplete(
  gameState: ServerGameState,
): boolean {
  return (
    gameState.moveCount >= gameState.edges.length
  );
}

// Apply one valid edge claim to the authoritative state.
function applyServerMove(
  gameState: ServerGameState,
  edgeId: string,
  movingPlayer: PlayerNumber,
): ServerGameState {
  // Assign the selected edge to the moving player.
  const updatedEdges = gameState.edges.map((edge) => {
    if (edge.id !== edgeId) {
      return edge;
    }

    return {
      ...edge,
      claimedBy: movingPlayer,
    };
  });

  // Find every newly completed box.
  const newlyCompletedBoxIds = gameState.boxes
    .filter(
      (box) =>
        box.claimedBy === null &&
        isBoxComplete(box, updatedEdges),
    )
    .map((box) => box.id);

  // Assign newly completed boxes to the moving player.
  const updatedBoxes = gameState.boxes.map((box) => {
    if (!newlyCompletedBoxIds.includes(box.id)) {
      return box;
    }

    return {
      ...box,
      claimedBy: movingPlayer,
    };
  });

  const completedBoxCount =
    newlyCompletedBoxIds.length;

  // Preserve the required two-player tuple.
  const updatedPlayers: [
    ServerPlayer,
    ServerPlayer,
  ] = [
      gameState.players[0].number === movingPlayer
        ? {
          ...gameState.players[0],
          score:
            gameState.players[0].score +
            completedBoxCount,
        }
        : gameState.players[0],

      gameState.players[1].number === movingPlayer
        ? {
          ...gameState.players[1],
          score:
            gameState.players[1].score +
            completedBoxCount,
        }
        : gameState.players[1],
    ];

  // A completed box grants another move.
  const nextPlayer =
    completedBoxCount > 0
      ? movingPlayer
      : getOtherPlayer(movingPlayer);

  return {
    ...gameState,
    edges: updatedEdges,
    boxes: updatedBoxes,
    players: updatedPlayers,
    currentPlayer: nextPlayer,
    moveCount: gameState.moveCount + 1,
  };
}

// Convert the internal room record into public room data.
function createRoomSummary(
  room: RoomRecord,
): OnlineRoom {
  const gameIsComplete =
    room.gameState !== null &&
    isServerGameComplete(room.gameState);

  let status: OnlineRoom["status"];

  if (room.players.length < 2) {
    status = "waiting";
  } else if (!room.gameState) {
    status = "ready";
  } else if (gameIsComplete) {
    status = "complete";
  } else {
    status = "playing";
  }

  return {
    roomCode: room.roomCode,
    status,
    players: room.players.map((player) => ({
      socketId: player.socketId,
      name: player.name,
      playerNumber: player.playerNumber,
      isConnected: player.isConnected,
    })),
    gameState: room.gameState
      ? {
        ...room.gameState,
        players: [
          {
            ...room.gameState.players[0],
          },
          {
            ...room.gameState.players[1],
          },
        ],
        edges: room.gameState.edges.map((edge) => ({
          ...edge,
        })),
        boxes: room.gameState.boxes.map((box) => ({
          ...box,
        })),
      }
      : null,
  };
}

// Broadcast lobby membership changes.
function broadcastRoomUpdate(
  room: RoomRecord,
): void {
  io.to(room.roomCode).emit(
    "room:updated",
    createRoomSummary(room),
  );
}

// Broadcast authoritative gameplay changes.
function broadcastGameUpdate(
  room: RoomRecord,
): void {
  io.to(room.roomCode).emit(
    "game:updated",
    createRoomSummary(room),
  );
}

// Permanently remove a player whose reconnection grace period
// expired before they returned.
function expireDisconnectedPlayer(
  roomCode: string,
  recoveryToken: string,
): void {
  const room = rooms.get(roomCode);

  if (!room) {
    return;
  }

  const disconnectedPlayer = room.players.find(
    (player) =>
      player.recoveryToken === recoveryToken &&
      !player.isConnected,
  );

  // The player may already have recovered before this timer fired.
  if (!disconnectedPlayer) {
    return;
  }

  room.players = room.players.filter(
    (player) => player.recoveryToken !== recoveryToken,
  );

  console.log(
    `${disconnectedPlayer.name}'s recovery period expired in room ${roomCode}.`,
  );

  // Delete the room if nobody remains.
  if (room.players.length === 0) {
    rooms.delete(roomCode);

    console.log(
      `Room deleted after reconnection timeout: ${roomCode}`,
    );

    return;
  }

  // An interrupted two-player game cannot continue once
  // the missing player's grace period has expired.
  room.gameState = null;

  // The remaining player becomes Player 1.
  room.players = room.players.map((player, index) => ({
    ...player,
    playerNumber: (index + 1) as PlayerNumber,
    disconnectTimer: null,
  }));

  const remainingPlayer = room.players[0];

  if (remainingPlayer) {
    const remainingSocket = io.sockets.sockets.get(
      remainingPlayer.socketId,
    );

    if (remainingSocket) {
      remainingSocket.data.playerNumber = 1;
    }
  }

  broadcastRoomUpdate(room);
}

// Preserve a player's room position and authoritative game state
// during a temporary Socket.IO disconnection.
function markPlayerDisconnected(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
): void {
  const roomCode = socket.data.roomCode;

  if (!roomCode) {
    return;
  }

  const room = rooms.get(roomCode);

  if (!room) {
    return;
  }

  const player = room.players.find(
    (roomPlayer) => roomPlayer.socketId === socket.id,
  );

  if (!player) {
    return;
  }

  player.isConnected = false;

  // Defensive cleanup in case an older timer somehow exists.
  if (player.disconnectTimer) {
    clearTimeout(player.disconnectTimer);
  }

  player.disconnectTimer = setTimeout(() => {
    expireDisconnectedPlayer(
      roomCode,
      player.recoveryToken,
    );
  }, RECONNECTION_GRACE_PERIOD_MS);

  console.log(
    `${player.name} can recover room ${roomCode} for the next 30 seconds.`,
  );

  // Keep the player and game state in the room.
  // Only their connection status changes.
  broadcastRoomUpdate(room);
}

// Remove a socket from its current room.
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

  if (room) {
    const player = room.players.find(
      (roomPlayer) => roomPlayer.socketId === socket.id,
    );

    if (player?.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }
  }

  socket.leave(roomCode);

  socket.data.roomCode = undefined;
  socket.data.playerName = undefined;
  socket.data.playerNumber = undefined;

  if (!room) {
    return null;
  }

  room.players = room.players.filter(
    (player) => player.socketId !== socket.id,
  );

  // Delete rooms after their final player leaves.
  if (room.players.length === 0) {
    rooms.delete(roomCode);

    console.log(`Room deleted: ${roomCode}`);

    return {
      roomCode,
      status: "waiting",
      players: [],
      gameState: null,
    };
  }

  // A multiplayer game cannot continue with one player.
  room.gameState = null;

  // The remaining member becomes Player 1.
  room.players = room.players.map((player, index) => ({
    ...player,
    playerNumber: (index + 1) as PlayerNumber,
  }));

  const remainingSocket = io.sockets.sockets.get(
    room.players[0].socketId,
  );

  if (remainingSocket) {
    remainingSocket.data.playerNumber = 1;
  }

  broadcastRoomUpdate(room);

  return createRoomSummary(room);
}

// Confirm that the Express server is running.
app.get("/", (_request, response) => {
  response.json({
    message: "LineLock server is running.",
  });
});

// Provide server-health and room-count information.
app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    application: "LineLock",
    realtime: "Socket.IO",
    activeRooms: rooms.size,
  });
});

// Handle every connected browser.
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Confirm the connection immediately.
  socket.emit("server:connection-ready", {
    socketId: socket.id,
    message:
      "The LineLock client is connected to the real-time server.",
    connectedAt: new Date().toISOString(),
  });

  // Respond to latency tests.
  socket.on("client:ping", (payload) => {
    socket.emit("server:pong", {
      sentAt: payload.sentAt,
      receivedAt: Date.now(),
    });
  });

  // Create a new multiplayer room.
  socket.on(
    "room:create",
    (payload, callback) => {
      removeSocketFromRoom(socket);

      const playerName = cleanPlayerName(
        payload.playerName,
      );

      const roomCode = generateRoomCode();

      const recoveryToken = generateRecoveryToken();

      const room: RoomRecord = {
        roomCode,
        players: [
          {
            socketId: socket.id,
            name: playerName,
            playerNumber: 1,
            isConnected: true,
            recoveryToken,
            disconnectTimer: null,
          },
        ],
        gameState: null,
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
        recoveryToken,
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

      removeSocketFromRoom(socket);

      const recoveryToken = generateRecoveryToken();

      room.players.push({
        socketId: socket.id,
        name: playerName,
        playerNumber: 2,
        isConnected: true,
        recoveryToken,
        disconnectTimer: null,
      });
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
        recoveryToken,
      });

      broadcastRoomUpdate(room);
    },
  );

  // Recover a player's existing room position after a
  // temporary Socket.IO disconnection.
  socket.on(
    "room:recover",
    (payload, callback) => {
      const roomCode = cleanRoomCode(
        payload.roomCode,
      );

      const recoveryToken =
        payload.recoveryToken.trim();

      if (!roomCode || !recoveryToken) {
        callback({
          success: false,
          message:
            "Room recovery information is incomplete.",
        });

        return;
      }

      // A socket already participating in a room should not
      // recover a second player identity.
      if (socket.data.roomCode) {
        callback({
          success: false,
          message:
            "Leave the current room before recovering another room.",
        });

        return;
      }

      const room = rooms.get(roomCode);

      if (!room) {
        callback({
          success: false,
          message:
            "The room is no longer available.",
        });

        return;
      }

      const recoveringPlayer = room.players.find(
        (player) =>
          player.recoveryToken === recoveryToken,
      );

      if (!recoveringPlayer) {
        callback({
          success: false,
          message:
            "The recovery token is not valid for this room.",
        });

        return;
      }

      if (recoveringPlayer.isConnected) {
        const existingSocket =
          io.sockets.sockets.get(
            recoveringPlayer.socketId,
          );

        if (existingSocket?.connected) {
          callback({
            success: false,
            message:
              "That player is already connected to the room.",
          });

          return;
        }

        // Defensive correction if the old socket disappeared
        // before its disconnect event updated the room record.
        recoveringPlayer.isConnected = false;
      }

      if (recoveringPlayer.disconnectTimer) {
        clearTimeout(
          recoveringPlayer.disconnectTimer,
        );

        recoveringPlayer.disconnectTimer = null;
      }

      // Replace the old temporary Socket.IO identity.
      recoveringPlayer.socketId = socket.id;
      recoveringPlayer.isConnected = true;

      socket.join(roomCode);

      socket.data.roomCode = roomCode;
      socket.data.playerName =
        recoveringPlayer.name;
      socket.data.playerNumber =
        recoveringPlayer.playerNumber;

      const roomSummary =
        createRoomSummary(room);

      console.log(
        `${recoveringPlayer.name} recovered Player ${recoveringPlayer.playerNumber} in room ${roomCode}.`,
      );

      callback({
        success: true,
        room: roomSummary,
        recoveryToken:
          recoveringPlayer.recoveryToken,
      });

      broadcastRoomUpdate(room);

      if (room.gameState) {
        broadcastGameUpdate(room);
      }
    },
  );

  // Allow a player to leave manually.
  socket.on("room:leave", (callback) => {
    const previousRoomCode =
      socket.data.roomCode;

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
          gameState: null,
        },
    });
  });

  // Start a new authoritative game.
  socket.on("game:start", (callback) => {
    const roomCode = socket.data.roomCode;

    if (!roomCode) {
      callback({
        success: false,
        message:
          "Join a room before starting a game.",
      });

      return;
    }

    const room = rooms.get(roomCode);

    if (!room) {
      callback({
        success: false,
        message:
          "The current room no longer exists.",
      });

      return;
    }

    if (!areAllRoomPlayersConnected(room)) {
      callback({
        success: false,
        message:
          "Two players must be connected before the game can start.",
      });

      return;
    }

    if (socket.data.playerNumber !== 1) {
      callback({
        success: false,
        message:
          "Only Player 1 can start the online match.",
      });

      return;
    }

    const playerOne = room.players.find(
      (player) => player.playerNumber === 1,
    );

    const playerTwo = room.players.find(
      (player) => player.playerNumber === 2,
    );

    if (!playerOne || !playerTwo) {
      callback({
        success: false,
        message:
          "Both player positions must be available.",
      });

      return;
    }

    room.gameState = createServerGameState(
      playerOne.name,
      playerTwo.name,
    );

    const roomSummary = createRoomSummary(room);

    console.log(
      `Online game started in room ${roomCode}`,
    );

    callback({
      success: true,
      room: roomSummary,
    });

    broadcastGameUpdate(room);
  });

  // Validate and apply one online edge move.
  socket.on(
    "game:move",
    (payload, callback) => {
      const roomCode = socket.data.roomCode;
      const playerNumber =
        socket.data.playerNumber;

      if (!roomCode || !playerNumber) {
        callback({
          success: false,
          message:
            "Join a room before making a move.",
        });

        return;
      }

      const room = rooms.get(roomCode);

      if (!room || !room.gameState) {
        callback({
          success: false,
          message:
            "The online game has not started.",
        });

        return;
      }

      if (!areAllRoomPlayersConnected(room)) {
        callback({
          success: false,
          message:
            "The match is paused while a player reconnects.",
        });

        return;
      }

      if (isServerGameComplete(room.gameState)) {
        callback({
          success: false,
          message:
            "The online game is already complete.",
        });

        return;
      }

      if (
        room.gameState.currentPlayer !== playerNumber
      ) {
        callback({
          success: false,
          message:
            "Wait for your turn before claiming an edge.",
        });

        return;
      }

      const selectedEdge =
        room.gameState.edges.find(
          (edge) => edge.id === payload.edgeId,
        );

      if (!selectedEdge) {
        callback({
          success: false,
          message:
            "The selected edge does not exist.",
        });

        return;
      }

      if (selectedEdge.claimedBy !== null) {
        callback({
          success: false,
          message:
            "That edge has already been claimed.",
        });

        return;
      }

      room.gameState = applyServerMove(
        room.gameState,
        payload.edgeId,
        playerNumber,
      );

      const roomSummary = createRoomSummary(room);

      callback({
        success: true,
        room: roomSummary,
      });

      broadcastGameUpdate(room);
    },
  );

  // Preserve room membership during temporary disconnections.
  socket.on("disconnect", (reason) => {
    const previousRoomCode =
      socket.data.roomCode;

    if (previousRoomCode) {
      markPlayerDisconnected(socket);

      console.log(
        `Player ${socket.id} temporarily disconnected from room ${previousRoomCode}. Reason: ${reason}`,
      );

      return;
    }

    console.log(
      `Player disconnected: ${socket.id}. Reason: ${reason}`,
    );
  });
});

// Log low-level connection errors.
io.engine.on("connection_error", (error) => {
  console.error(
    `Socket.IO connection error: ${error.message}`,
  );
});

// Start Express and Socket.IO.
httpServer.listen(PORT, "127.0.0.1", () => {
  console.log(
    `LineLock server is running at http://127.0.0.1:${PORT}`,
  );
});