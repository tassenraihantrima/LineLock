import {
    useEffect,
    useState,
} from "react";
import { Link } from "react-router";
import {
    socket,
    socketServerUrl,
    type ConnectionReadyPayload,
    type PongPayload,
} from "../socket/socket";

// Represent every connection state shown by the online page.
type ConnectionStatus =
    | "connecting"
    | "connected"
    | "disconnected"
    | "error";

function OnlineGamePage() {
    // Display the current Socket.IO connection lifecycle.
    const [
        connectionStatus,
        setConnectionStatus,
    ] = useState<ConnectionStatus>("connecting");

    // Display the unique identifier assigned by Socket.IO.
    const [socketId, setSocketId] = useState<string | null>(
        null,
    );

    // Display the server's connection confirmation.
    const [serverMessage, setServerMessage] = useState(
        "Opening a real-time connection to the LineLock server.",
    );

    // Store the time when the server confirmed the connection.
    const [connectedAt, setConnectedAt] = useState<
        string | null
    >(null);

    // Display the latest measured client-server round trip.
    const [latency, setLatency] = useState<number | null>(
        null,
    );

    // Record whether a ping request is currently waiting for a pong.
    const [pingIsPending, setPingIsPending] = useState(false);

    useEffect(() => {
        // Update the page when the low-level Socket.IO connection opens.
        function handleConnect() {
            setConnectionStatus("connected");
            setSocketId(socket.id ?? null);
            setServerMessage(
                "Connected. Waiting for server confirmation.",
            );
        }

        // Display the reason when the connection closes.
        function handleDisconnect(reason: string) {
            setConnectionStatus("disconnected");
            setSocketId(null);
            setPingIsPending(false);
            setServerMessage(
                `The real-time connection closed: ${reason}.`,
            );
        }

        // Display connection errors without crashing the application.
        function handleConnectError(error: Error) {
            setConnectionStatus("error");
            setSocketId(null);
            setPingIsPending(false);
            setServerMessage(
                `Unable to connect to the LineLock server: ${error.message}`,
            );
        }

        // Store the typed confirmation sent by the server.
        function handleConnectionReady(
            payload: ConnectionReadyPayload,
        ) {
            setConnectionStatus("connected");
            setSocketId(payload.socketId);
            setServerMessage(payload.message);
            setConnectedAt(payload.connectedAt);
        }

        // Calculate the browser-to-server-to-browser round-trip time.
        function handlePong(payload: PongPayload) {
            const roundTripTime = Date.now() - payload.sentAt;

            setLatency(roundTripTime);
            setPingIsPending(false);
        }

        // Register listeners before opening the connection so no
        // server events are missed.
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        socket.on(
            "server:connection-ready",
            handleConnectionReady,
        );

        socket.on("server:pong", handlePong);

        // Open the connection when the online route is displayed.
        if (!socket.connected) {
            setConnectionStatus("connecting");
            socket.connect();
        } else {
            handleConnect();
        }

        // Remove every listener and close the connection when the user
        // leaves the online route.
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);

            socket.off(
                "server:connection-ready",
                handleConnectionReady,
            );

            socket.off("server:pong", handlePong);
            socket.disconnect();
        };
    }, []);

    // Send the current timestamp to test real-time communication.
    function handlePingServer() {
        if (!socket.connected) {
            setServerMessage(
                "Connect to the server before sending a ping.",
            );

            return;
        }

        setPingIsPending(true);

        socket.emit("client:ping", {
            sentAt: Date.now(),
        });
    }

    // Manually retry after a failed or closed connection.
    function handleReconnect() {
        if (socket.connected) {
            return;
        }

        setConnectionStatus("connecting");
        setServerMessage(
            "Attempting to reconnect to the LineLock server.",
        );

        socket.connect();
    }

    // Select a readable status label for the interface.
    const connectionStatusLabel =
        connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "connecting"
                ? "Connecting"
                : connectionStatus === "error"
                    ? "Connection error"
                    : "Disconnected";

    return (
        <main className="main-content online-page">
            <section className="hero-section online-hero">
                <p className="eyebrow">
                    Online multiplayer
                </p>

                <h1>
                    The LineLock client is ready for real-time play.
                </h1>

                <p className="hero-description">
                    Phase 10 connects this React page to the Socket.IO server
                    and verifies bidirectional communication before online
                    rooms are introduced.
                </p>
            </section>

            <section
                className="socket-connection-card"
                aria-labelledby="socket-connection-heading"
            >
                <div className="socket-card-heading">
                    <div>
                        <p className="online-card-label">
                            Real-time server
                        </p>

                        <h2 id="socket-connection-heading">
                            Socket.IO Connection
                        </h2>
                    </div>

                    <span
                        className={`connection-status connection-status-${connectionStatus}`}
                        role="status"
                        aria-live="polite"
                    >
                        <span aria-hidden="true" />
                        {connectionStatusLabel}
                    </span>
                </div>

                <p className="socket-server-message">
                    {serverMessage}
                </p>

                <div className="socket-detail-grid">
                    <article>
                        <span>Server URL</span>
                        <strong>{socketServerUrl}</strong>
                    </article>

                    <article>
                        <span>Socket ID</span>
                        <strong>
                            {socketId ?? "Not assigned"}
                        </strong>
                    </article>

                    <article>
                        <span>Connected at</span>
                        <strong>
                            {connectedAt
                                ? new Date(
                                    connectedAt,
                                ).toLocaleTimeString()
                                : "Not connected"}
                        </strong>
                    </article>

                    <article>
                        <span>Round-trip latency</span>
                        <strong>
                            {latency === null
                                ? "Not tested"
                                : `${latency} ms`}
                        </strong>
                    </article>
                </div>

                <div className="socket-actions">
                    <button
                        className="socket-primary-button"
                        type="button"
                        disabled={
                            connectionStatus !== "connected" ||
                            pingIsPending
                        }
                        onClick={handlePingServer}
                    >
                        {pingIsPending
                            ? "Waiting for Server..."
                            : "Ping Server"}
                    </button>

                    {connectionStatus !== "connected" && (
                        <button
                            className="secondary-control-button"
                            type="button"
                            disabled={
                                connectionStatus === "connecting"
                            }
                            onClick={handleReconnect}
                        >
                            {connectionStatus === "connecting"
                                ? "Connecting..."
                                : "Reconnect"}
                        </button>
                    )}
                </div>
            </section>

            <section className="online-next-step-card">
                <p className="online-card-label">
                    Next milestone
                </p>

                <h2>Online rooms begin in Phase 11.</h2>

                <p>
                    The browser and server can now exchange typed real-time
                    events. The next phase will use this connection to create
                    and join multiplayer rooms.
                </p>

                <div className="online-phase-list">
                    <article className="completed-online-phase">
                        <span>Phase 10</span>
                        <strong>Socket.IO Integration</strong>
                    </article>

                    <article>
                        <span>Phase 11</span>
                        <strong>Online Rooms</strong>
                    </article>

                    <article>
                        <span>Phase 12</span>
                        <strong>Server-Controlled State</strong>
                    </article>
                </div>

                <Link
                    className="secondary-page-link"
                    to="/local"
                >
                    Play a local match
                </Link>
            </section>
        </main>
    );
}

export default OnlineGamePage;