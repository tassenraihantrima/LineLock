import {
    io,
    type Socket,
} from "socket.io-client";

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

// Events the Socket.IO server can send to the React client.
interface ServerToClientEvents {
    "server:connection-ready": (
        payload: ConnectionReadyPayload,
    ) => void;

    "server:pong": (
        payload: PongPayload,
    ) => void;
}

// Events the React client can send to the Socket.IO server.
interface ClientToServerEvents {
    "client:ping": (
        payload: PingPayload,
    ) => void;
}

// Use a deployment URL when one is provided.
// Fall back to the local LineLock server during development.
const SERVER_URL =
    import.meta.env.VITE_SERVER_URL ??
    "http://127.0.0.1:3001";

// Create one reusable typed socket instance.
//
// autoConnect is disabled so pages can control when the browser
// opens and closes its real-time server connection.
export const socket: Socket<
    ServerToClientEvents,
    ClientToServerEvents
> = io(SERVER_URL, {
    autoConnect: false,
});

// Export the URL so the online page can display its destination.
export const socketServerUrl = SERVER_URL;