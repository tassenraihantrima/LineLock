import {
    io,
    type Socket,
} from "socket.io-client";

// Identify the two player positions inside an online room.
export type OnlinePlayerNumber = 1 | 2;

// Describe the data sent when the server accepts a connection.
export type ConnectionReadyPayload = {
    socketId: string;
    message: string;
    connectedAt: string;
};

// Describe the timestamp sent from the browser to the server.
export type PingPayload = {
    sentAt: number;
};

// Describe the timestamps returned by the server.
export type PongPayload = {
    sentAt: number;
    receivedAt: number;
};

// Describe one player currently inside an online room.
export type OnlineRoomPlayer = {
    socketId: string;
    name: string;
    playerNumber: OnlinePlayerNumber;
};

// Describe the current state of an online lobby.
export type OnlineRoom = {
    roomCode: string;
    status: "waiting" | "ready";
    players: OnlineRoomPlayer[];
};

// Describe the information required to create a room.
export type CreateRoomPayload = {
    playerName: string;
};

// Describe the information required to join a room.
export type JoinRoomPayload = {
    roomCode: string;
    playerName: string;
};

// Return either the updated room or a readable validation error.
export type RoomActionResponse =
    | {
        success: true;
        room: OnlineRoom;
    }
    | {
        success: false;
        message: string;
    };

// Events the Socket.IO server can send to the React client.
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

// Events the React client can send to the Socket.IO server.
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

// Use a deployment URL when one is provided.
// Fall back to the local LineLock server during development.
const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ??
    "http://127.0.0.1:3001";

// Create one reusable typed Socket.IO client.
// Automatic connection remains disabled so the online page controls
// when the browser opens and closes its real-time connection.
export const socket: Socket<
    ServerToClientEvents,
    ClientToServerEvents
> = io(SERVER_URL, {
    autoConnect: false,
});

// Export the URL so the online page can display its destination.
export const socketServerUrl = SERVER_URL;