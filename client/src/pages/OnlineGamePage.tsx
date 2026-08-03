import {
    useEffect,
    useState,
} from "react";
import { Link } from "react-router";
import {
    socket,
    socketServerUrl,
    type ConnectionReadyPayload,
    type OnlineRoom,
    type PongPayload,
    type RoomActionResponse,
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

    // Display the server's latest connection message.
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

    // Record whether a ping request is waiting for a pong.
    const [pingIsPending, setPingIsPending] = useState(false);

    // Store the player's name before creating or joining a room.
    const [playerName, setPlayerName] = useState("");

    // Store the room code entered into the join form.
    const [roomCodeInput, setRoomCodeInput] = useState("");

    // Store the room currently joined by this browser.
    const [activeRoom, setActiveRoom] =
        useState<OnlineRoom | null>(null);

    // Display room validation and membership messages.
    const [roomMessage, setRoomMessage] = useState(
        "Create a room or join one using a code from another player.",
    );

    // Prevent duplicate room requests while waiting for the server.
    const [roomActionIsPending, setRoomActionIsPending] =
        useState(false);

    useEffect(() => {
        // Update the page when the Socket.IO connection opens.
        function handleConnect() {
            setConnectionStatus("connected");
            setSocketId(socket.id ?? null);
            setServerMessage(
                "Connected. Waiting for server confirmation.",
            );
        }

        // Clear local room membership when this socket disconnects.
        function handleDisconnect(reason: string) {
            setConnectionStatus("disconnected");
            setSocketId(null);
            setConnectedAt(null);
            setLatency(null);
            setPingIsPending(false);
            setRoomActionIsPending(false);
            setActiveRoom(null);

            setServerMessage(
                `The real-time connection closed: ${reason}.`,
            );

            setRoomMessage(
                "The room connection ended. Reconnect before creating or joining another room.",
            );
        }

        // Display connection errors without crashing the application.
        function handleConnectError(error: Error) {
            setConnectionStatus("error");
            setSocketId(null);
            setPingIsPending(false);
            setRoomActionIsPending(false);

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

        // Calculate the complete browser-server-browser round trip.
        function handlePong(payload: PongPayload) {
            const roundTripTime = Date.now() - payload.sentAt;

            setLatency(roundTripTime);
            setPingIsPending(false);
        }

        // Receive room changes created by joins, leaves, or disconnects.
        function handleRoomUpdated(room: OnlineRoom) {
            setActiveRoom(room);

            setRoomMessage(
                room.status === "ready"
                    ? "Both players are connected. The room is ready for gameplay."
                    : "The room is waiting for a second player.",
            );
        }

        // Register every event before opening the connection.
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        socket.on(
            "server:connection-ready",
            handleConnectionReady,
        );

        socket.on("server:pong", handlePong);
        socket.on("room:updated", handleRoomUpdated);

        // Open the connection when the online route is displayed.
        if (!socket.connected) {
            setConnectionStatus("connecting");
            socket.connect();
        } else {
            handleConnect();
        }

        // Remove listeners and close the connection when leaving the route.
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);

            socket.off(
                "server:connection-ready",
                handleConnectionReady,
            );

            socket.off("server:pong", handlePong);
            socket.off("room:updated", handleRoomUpdated);

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

    // Create a room and become its first player.
    function handleCreateRoom() {
        if (!socket.connected) {
            setRoomMessage(
                "Connect to the server before creating a room.",
            );

            return;
        }

        setRoomActionIsPending(true);

        socket.emit(
            "room:create",
            {
                playerName,
            },
            (response: RoomActionResponse) => {
                setRoomActionIsPending(false);

                if ("message" in response) {
                    setRoomMessage(response.message);

                    return;
                }

                setActiveRoom(response.room);
                setRoomCodeInput(response.room.roomCode);

                setRoomMessage(
                    "Room created. Share the code with the second player.",
                );
            },
        );
    }

    // Join the room matching the submitted code.
    function handleJoinRoom(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!socket.connected) {
            setRoomMessage(
                "Connect to the server before joining a room.",
            );

            return;
        }

        setRoomActionIsPending(true);

        socket.emit(
            "room:join",
            {
                playerName,
                roomCode: roomCodeInput,
            },
            (response: RoomActionResponse) => {
                setRoomActionIsPending(false);

                if ("message" in response) {
                    setRoomMessage(response.message);

                    return;
                }

                setActiveRoom(response.room);
                setRoomCodeInput(response.room.roomCode);

                setRoomMessage(
                    response.room.status === "ready"
                        ? "Room joined. Both players are ready."
                        : "Room joined. Waiting for another player.",
                );
            },
        );
    }

    // Leave the current room while keeping the server connection open.
    function handleLeaveRoom() {
        if (!socket.connected || !activeRoom) {
            return;
        }

        setRoomActionIsPending(true);

        socket.emit(
            "room:leave",
            (response: RoomActionResponse) => {
                setRoomActionIsPending(false);

                if ("message" in response) {
                    setRoomMessage(response.message);

                    return;
                }

                setActiveRoom(null);
                setRoomCodeInput("");

                setRoomMessage(
                    "You left the room. Create or join another room when ready.",
                );
            },
        );
    }

    // Copy the active room code using the browser clipboard API.
    async function handleCopyRoomCode() {
        if (!activeRoom) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                activeRoom.roomCode,
            );

            setRoomMessage(
                "Room code copied to the clipboard.",
            );
        } catch {
            setRoomMessage(
                `Copy failed. Share this code manually: ${activeRoom.roomCode}`,
            );
        }
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

    // Identify this browser's player entry inside the active room.
    const currentRoomPlayer = activeRoom?.players.find(
        (player) => player.socketId === socketId,
    );

    return (
        <main className="main-content online-page">
            <section className="hero-section online-hero">
                <p className="eyebrow">
                    Online multiplayer
                </p>

                <h1>
                    Create a room and invite another player.
                </h1>

                <p className="hero-description">
                    Phase 11 adds real-time room creation, room codes, lobby
                    membership, and two-player readiness before synchronized
                    gameplay begins.
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

            <section
                className="online-room-card"
                aria-labelledby="online-room-heading"
            >
                <div className="online-room-heading">
                    <div>
                        <p className="online-card-label">
                            Multiplayer lobby
                        </p>

                        <h2 id="online-room-heading">
                            {activeRoom
                                ? `Room ${activeRoom.roomCode}`
                                : "Create or join a room"}
                        </h2>
                    </div>

                    {activeRoom && (
                        <span
                            className={`room-status room-status-${activeRoom.status}`}
                        >
                            {activeRoom.status === "ready"
                                ? "Ready"
                                : "Waiting"}
                        </span>
                    )}
                </div>

                <p
                    className="online-room-message"
                    aria-live="polite"
                >
                    {roomMessage}
                </p>

                {!activeRoom ? (
                    <div className="room-entry-grid">
                        <section className="room-entry-panel">
                            <p className="room-panel-label">
                                Your identity
                            </p>

                            <label className="online-room-field">
                                <span>Player name</span>

                                <input
                                    type="text"
                                    value={playerName}
                                    maxLength={20}
                                    autoComplete="off"
                                    placeholder="Enter your name"
                                    onChange={(event) => {
                                        setPlayerName(event.target.value);
                                    }}
                                />
                            </label>
                        </section>

                        <section className="room-entry-panel">
                            <p className="room-panel-label">
                                Host a match
                            </p>

                            <h3>Create a new room</h3>

                            <p>
                                Generate a private code and wait for one opponent
                                to join.
                            </p>

                            <button
                                className="socket-primary-button"
                                type="button"
                                disabled={
                                    connectionStatus !== "connected" ||
                                    roomActionIsPending
                                }
                                onClick={handleCreateRoom}
                            >
                                {roomActionIsPending
                                    ? "Contacting Server..."
                                    : "Create Room"}
                            </button>
                        </section>

                        <form
                            className="room-entry-panel"
                            onSubmit={handleJoinRoom}
                        >
                            <p className="room-panel-label">
                                Join a match
                            </p>

                            <h3>Enter a room code</h3>

                            <label className="online-room-field">
                                <span>Six-character code</span>

                                <input
                                    type="text"
                                    value={roomCodeInput}
                                    maxLength={6}
                                    autoComplete="off"
                                    placeholder="ABC123"
                                    onChange={(event) => {
                                        setRoomCodeInput(
                                            event.target.value.toUpperCase(),
                                        );
                                    }}
                                />
                            </label>

                            <button
                                className="secondary-control-button"
                                type="submit"
                                disabled={
                                    connectionStatus !== "connected" ||
                                    roomActionIsPending
                                }
                            >
                                {roomActionIsPending
                                    ? "Contacting Server..."
                                    : "Join Room"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="active-room-content">
                        <section className="room-code-panel">
                            <p>Room code</p>

                            <strong>{activeRoom.roomCode}</strong>

                            <button
                                className="copy-room-code-button"
                                type="button"
                                onClick={handleCopyRoomCode}
                            >
                                Copy Code
                            </button>
                        </section>

                        <section className="room-player-list">
                            <article
                                className={
                                    currentRoomPlayer?.playerNumber === 1
                                        ? "current-room-player"
                                        : ""
                                }
                            >
                                <div>
                                    <span className="room-player-number">
                                        Player 1
                                    </span>

                                    <strong>
                                        {activeRoom.players.find(
                                            (player) =>
                                                player.playerNumber === 1,
                                        )?.name ?? "Waiting for player"}
                                    </strong>
                                </div>

                                <span className="room-player-state">
                                    Connected
                                </span>
                            </article>

                            <article
                                className={
                                    currentRoomPlayer?.playerNumber === 2
                                        ? "current-room-player"
                                        : ""
                                }
                            >
                                <div>
                                    <span className="room-player-number">
                                        Player 2
                                    </span>

                                    <strong>
                                        {activeRoom.players.find(
                                            (player) =>
                                                player.playerNumber === 2,
                                        )?.name ?? "Waiting for player"}
                                    </strong>
                                </div>

                                <span
                                    className={`room-player-state ${activeRoom.players.length < 2
                                            ? "waiting-player-state"
                                            : ""
                                        }`}
                                >
                                    {activeRoom.players.length < 2
                                        ? "Waiting"
                                        : "Connected"}
                                </span>
                            </article>
                        </section>

                        <div className="active-room-actions">
                            <p>
                                {currentRoomPlayer
                                    ? `You are Player ${currentRoomPlayer.playerNumber}.`
                                    : "Your room position is being updated."}
                            </p>

                            <button
                                className="leave-room-button"
                                type="button"
                                disabled={roomActionIsPending}
                                onClick={handleLeaveRoom}
                            >
                                {roomActionIsPending
                                    ? "Leaving..."
                                    : "Leave Room"}
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <section className="online-next-step-card">
                <p className="online-card-label">
                    Next milestone
                </p>

                <h2>
                    Server-controlled gameplay begins in Phase 12.
                </h2>

                <p>
                    Both browsers can now enter the same room and receive
                    membership updates. The next phase will place the board
                    and move validation on the server.
                </p>

                <div className="online-phase-list">
                    <article className="completed-online-phase">
                        <span>Phase 10</span>
                        <strong>Socket.IO Integration</strong>
                    </article>

                    <article className="completed-online-phase">
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