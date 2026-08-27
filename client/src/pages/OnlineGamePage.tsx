import {
    useEffect,
    useState,
    type SubmitEvent,
} from "react";
import { Link } from "react-router";
import GameBoard from "../components/GameBoard";
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

const RECOVERY_ROOM_CODE_KEY =
    "linelock:recovery-room-code";

const RECOVERY_TOKEN_KEY =
    "linelock:recovery-token";

type RecoveryCredentials = {
    roomCode: string;
    recoveryToken: string;
};

// Store recovery credentials only for this browser tab/session.
function saveRecoveryCredentials(
    roomCode: string,
    recoveryToken: string,
): void {
    sessionStorage.setItem(
        RECOVERY_ROOM_CODE_KEY,
        roomCode,
    );

    sessionStorage.setItem(
        RECOVERY_TOKEN_KEY,
        recoveryToken,
    );
}

function getRecoveryCredentials():
    RecoveryCredentials | null {
    const roomCode = sessionStorage.getItem(
        RECOVERY_ROOM_CODE_KEY,
    );

    const recoveryToken = sessionStorage.getItem(
        RECOVERY_TOKEN_KEY,
    );

    if (!roomCode || !recoveryToken) {
        return null;
    }

    return {
        roomCode,
        recoveryToken,
    };
}

function clearRecoveryCredentials(): void {
    sessionStorage.removeItem(
        RECOVERY_ROOM_CODE_KEY,
    );

    sessionStorage.removeItem(
        RECOVERY_TOKEN_KEY,
    );
}

function OnlineGamePage() {
    // Display the current Socket.IO connection lifecycle.
    const [
        connectionStatus,
        setConnectionStatus,
    ] = useState<ConnectionStatus>("connecting");

    // Display the identifier assigned by Socket.IO.
    const [socketId, setSocketId] = useState<string | null>(
        null,
    );

    // Display the server's latest connection message.
    const [serverMessage, setServerMessage] = useState(
        "Opening a real-time connection to the LineLock server.",
    );

    // Store the server-confirmed connection time.
    const [connectedAt, setConnectedAt] = useState<
        string | null
    >(null);

    // Display the latest round-trip latency.
    const [latency, setLatency] = useState<number | null>(
        null,
    );

    // Record whether a ping is waiting for a response.
    const [pingIsPending, setPingIsPending] = useState(false);

    // Store the room code entered into the join form.
    const [roomCodeInput, setRoomCodeInput] = useState("");

    // Store the authoritative room received from the server.
    const [activeRoom, setActiveRoom] =
        useState<OnlineRoom | null>(null);

    // Display lobby, move, and validation information.
    const [roomMessage, setRoomMessage] = useState(
        "Create a room or join one using a code from another player.",
    );

    // Prevent duplicate room and game requests.
    const [roomActionIsPending, setRoomActionIsPending] =
        useState(false);

    useEffect(() => {
        // Recover the player's previous room position when
        // Socket.IO establishes a replacement connection.
        function attemptRoomRecovery() {
            const credentials =
                getRecoveryCredentials();

            if (!credentials || !socket.connected) {
                return;
            }

            setRoomActionIsPending(true);

            setRoomMessage(
                "Recovering your previous room position...",
            );

            socket.emit(
                "room:recover",
                credentials,
                (response: RoomActionResponse) => {
                    setRoomActionIsPending(false);

                    if ("message" in response) {
                        clearRecoveryCredentials();
                        setActiveRoom(null);

                        setRoomMessage(
                            `${response.message} Create or join a new room.`,
                        );

                        return;
                    }

                    if (response.recoveryToken) {
                        saveRecoveryCredentials(
                            response.room.roomCode,
                            response.recoveryToken,
                        );
                    }

                    setActiveRoom(response.room);

                    setRoomCodeInput(
                        response.room.roomCode,
                    );

                    setRoomMessage(
                        response.room.gameState
                            ? "Room recovered. Your online match has been restored."
                            : "Room recovered successfully.",
                    );
                },
            );
        }

        // Update the page when the socket connection opens.
        function handleConnect() {
            setConnectionStatus("connected");
            setSocketId(socket.id ?? null);

            setServerMessage(
                "Connected. Waiting for server confirmation.",
            );

            attemptRoomRecovery();
        }

        // Clear room information after disconnection.
        function handleDisconnect(reason: string) {
            setConnectionStatus("disconnected");
            setSocketId(null);
            setConnectedAt(null);
            setLatency(null);
            setPingIsPending(false);
            setRoomActionIsPending(false);

            setServerMessage(
                `The real-time connection closed: ${reason}.`,
            );

            const recoveryCredentials =
                getRecoveryCredentials();

            setRoomMessage(
                recoveryCredentials
                    ? "Connection interrupted. Your room position is being preserved while LineLock reconnects."
                    : "The server connection ended. Reconnect before creating or joining a room.",
            );
        }

        // Display connection errors.
        function handleConnectError(error: Error) {
            setConnectionStatus("error");
            setSocketId(null);
            setPingIsPending(false);
            setRoomActionIsPending(false);

            setServerMessage(
                `Unable to connect to the LineLock server: ${error.message}`,
            );
        }

        // Store the server's connection confirmation.
        function handleConnectionReady(
            payload: ConnectionReadyPayload,
        ) {
            setConnectionStatus("connected");
            setSocketId(payload.socketId);
            setServerMessage(payload.message);
            setConnectedAt(payload.connectedAt);
        }

        // Calculate browser-server-browser latency.
        function handlePong(payload: PongPayload) {
            setLatency(Date.now() - payload.sentAt);
            setPingIsPending(false);
        }

        // Store lobby membership updates.
        function handleRoomUpdated(room: OnlineRoom) {
            setActiveRoom(room);

            const disconnectedPlayer =
                room.players.find(
                    (player) => !player.isConnected,
                );

            if (disconnectedPlayer) {
                setRoomMessage(
                    `${disconnectedPlayer.name} disconnected. Their position is reserved briefly while they reconnect.`,
                );

                return;
            }

            if (room.status === "waiting") {
                setRoomMessage(
                    "The room is waiting for a second player.",
                );
            } else if (room.status === "ready") {
                setRoomMessage(
                    "Both players are connected. Player 1 can start the match.",
                );
            }
        }

        // Store authoritative game updates.
        function handleGameUpdated(room: OnlineRoom) {
            setActiveRoom(room);

            if (room.status === "complete") {
                setRoomMessage(
                    "Every edge has been claimed. The online match is complete.",
                );

                return;
            }

            const gameState = room.gameState;

            if (!gameState) {
                return;
            }

            const activePlayer = gameState.players.find(
                (player) =>
                    player.number === gameState.currentPlayer,
            );

            setRoomMessage(
                `${activePlayer?.name ?? "The next player"} now has control of the board.`,
            );
        }

        // Register listeners before connecting.
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        socket.on(
            "server:connection-ready",
            handleConnectionReady,
        );

        socket.on("server:pong", handlePong);
        socket.on("room:updated", handleRoomUpdated);
        socket.on("game:updated", handleGameUpdated);

        if (!socket.connected) {
            setConnectionStatus("connecting");
            socket.connect();
        } else {
            handleConnect();
        }

        // Remove listeners and disconnect when leaving the route.
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
            socket.off("game:updated", handleGameUpdated);

            socket.disconnect();
        };
    }, []);

    // Test bidirectional real-time communication.
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

    // Retry a failed connection.
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

    // Create a new room using the authenticated account.
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
            {},
            (response: RoomActionResponse) => {
                setRoomActionIsPending(false);

                if ("message" in response) {
                    setRoomMessage(response.message);

                    return;
                }

                if (response.recoveryToken) {
                    saveRecoveryCredentials(
                        response.room.roomCode,
                        response.recoveryToken,
                    );
                }

                setActiveRoom(response.room);
                setRoomCodeInput(response.room.roomCode);

                setRoomMessage(
                    "Room created. Share the code with the second player.",
                );
            },
        );
    }

    // Join an existing room using the authenticated account.
    function handleJoinRoom(
        event: SubmitEvent<HTMLFormElement>,
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
                roomCode: roomCodeInput,
            },
            (response: RoomActionResponse) => {
                setRoomActionIsPending(false);

                if ("message" in response) {
                    setRoomMessage(response.message);

                    return;
                }

                if (response.recoveryToken) {
                    saveRecoveryCredentials(
                        response.room.roomCode,
                        response.recoveryToken,
                    );
                }

                setActiveRoom(response.room);
                setRoomCodeInput(response.room.roomCode);

                setRoomMessage(
                    response.room.status === "ready"
                        ? "Room joined. Player 1 can start the match."
                        : "Room joined. Waiting for another player.",
                );
            },
        );
    }

    // Leave the current room.
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

                clearRecoveryCredentials();

                setActiveRoom(null);
                setRoomCodeInput("");

                setRoomMessage(
                    "You left the room. Create or join another room when ready.",
                );
            },
        );
    }

    // Copy the active room code.
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

    // Ask the server to create a fresh online game.
    function handleStartOnlineGame() {
        if (!socket.connected || !activeRoom) {
            return;
        }

        setRoomActionIsPending(true);

        socket.emit(
            "game:start",
            (response: RoomActionResponse) => {
                setRoomActionIsPending(false);

                if ("message" in response) {
                    setRoomMessage(response.message);

                    return;
                }

                setActiveRoom(response.room);

                setRoomMessage(
                    `${response.room.gameState?.players[0].name ?? "Player 1"} begins the online match.`,
                );
            },
        );
    }

    // Send an edge request without changing game state locally.
    function handleOnlineEdgeClick(edgeId: string) {
        if (!socket.connected || !activeRoom?.gameState) {
            return;
        }

        socket.emit(
            "game:move",
            {
                edgeId,
            },
            (response: RoomActionResponse) => {
                if ("message" in response) {
                    setRoomMessage(response.message);

                    return;
                }

                // The server also broadcasts game:updated.
                // Storing the acknowledgement keeps this browser responsive.
                setActiveRoom(response.room);
            },
        );
    }

    const connectionStatusLabel =
        connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "connecting"
                ? "Connecting"
                : connectionStatus === "error"
                    ? "Connection error"
                    : "Disconnected";

    // Identify this browser's room position.
    const currentRoomPlayer = activeRoom?.players.find(
        (player) => player.socketId === socketId,
    );

    const onlineGameState =
        activeRoom?.gameState ?? null;

    const disconnectedRoomPlayer =
        activeRoom?.players.find(
            (player) => !player.isConnected,
        );

    const allRoomPlayersConnected =
        activeRoom?.players.length === 2 &&
        activeRoom.players.every(
            (player) => player.isConnected,
        );

    const onlineGameIsComplete =
        onlineGameState !== null &&
        onlineGameState.moveCount >=
        onlineGameState.edges.length;

    // Only the active server-assigned player can use the board.
    const currentBrowserCanMove =
        onlineGameState !== null &&
        currentRoomPlayer !== undefined &&
        currentRoomPlayer.playerNumber ===
        onlineGameState.currentPlayer &&
        allRoomPlayersConnected &&
        !onlineGameIsComplete;

    const onlineCurrentPlayer =
        onlineGameState?.players.find(
            (player) =>
                player.number ===
                onlineGameState.currentPlayer,
        );

    const onlineWinningPlayer =
        onlineGameState &&
            onlineGameState.players[0].score >
            onlineGameState.players[1].score
            ? onlineGameState.players[0]
            : onlineGameState &&
                onlineGameState.players[1].score >
                onlineGameState.players[0].score
                ? onlineGameState.players[1]
                : null;

    return (
        <main className="main-content online-page">
            <section className="hero-section online-hero">
                <p className="eyebrow">
                    Online multiplayer
                </p>

                <h1>
                    Play a synchronized LineLock match.
                </h1>

                <p className="hero-description">
                    Every online move is validated by the server and
                    broadcast to both players from one authoritative game
                    state.
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
                            Multiplayer room
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
                            {activeRoom.status}
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
                                Host a match
                            </p>

                            <h3>Create a new room</h3>

                            <p>
                                Generate a private room and wait for one opponent.
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
                            {[1, 2].map((playerNumber) => {
                                const roomPlayer =
                                    activeRoom.players.find(
                                        (player) =>
                                            player.playerNumber ===
                                            playerNumber,
                                    );

                                return (
                                    <article
                                        key={playerNumber}
                                        className={
                                            currentRoomPlayer?.playerNumber ===
                                                playerNumber
                                                ? "current-room-player"
                                                : ""
                                        }
                                    >
                                        <div>
                                            <span className="room-player-number">
                                                Player {playerNumber}
                                            </span>

                                            <strong>
                                                {roomPlayer?.name ??
                                                    "Waiting for player"}
                                            </strong>
                                        </div>

                                        <span
                                            className={`room-player-state ${!roomPlayer ||
                                                !roomPlayer.isConnected
                                                ? "waiting-player-state"
                                                : ""
                                                }`}
                                        >
                                            {!roomPlayer
                                                ? "Waiting"
                                                : roomPlayer.isConnected
                                                    ? "Connected"
                                                    : "Reconnecting..."}
                                        </span>
                                    </article>
                                );
                            })}
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

                        {activeRoom.status === "ready" &&
                            allRoomPlayersConnected &&
                            currentRoomPlayer?.playerNumber === 1 && (
                                <button
                                    className="restart-button"
                                    type="button"
                                    onClick={handleStartOnlineGame}
                                    disabled={roomActionIsPending}
                                >
                                    {roomActionIsPending
                                        ? "Starting..."
                                        : "Start Online Match"}
                                </button>
                            )}

                        {activeRoom.status === "ready" &&
                            allRoomPlayersConnected &&
                            currentRoomPlayer?.playerNumber === 2 && (
                                <p className="waiting-for-host-message">
                                    Waiting for Player 1 to start the match.
                                </p>
                            )}

                        {activeRoom.status === "ready" &&
                            !allRoomPlayersConnected && (
                                <p className="waiting-for-host-message">
                                    The match is paused until both players are connected.
                                </p>
                            )}
                    </div>
                )}
            </section>

            {onlineGameState && (
                <section className="online-game-area">
                    <section
                        className="game-feedback online-turn-feedback"
                        aria-live="polite"
                    >
                        <span aria-hidden="true">i</span>

                        <p>
                            {onlineGameIsComplete
                                ? "The online match is complete."
                                : disconnectedRoomPlayer
                                    ? `${disconnectedRoomPlayer.name} disconnected. The match is paused while they reconnect.`
                                    : currentBrowserCanMove
                                        ? "Your turn. Choose an available edge."
                                        : `${onlineCurrentPlayer?.name ?? "The other player"} is choosing an edge.`}
                        </p>
                    </section>

                    <section
                        className="game-information"
                        aria-label="Online game information"
                    >
                        <article
                            className={`player-card ${!onlineGameIsComplete &&
                                onlineGameState.currentPlayer === 1
                                ? "active-player player-one-active"
                                : ""
                                }`}
                        >
                            <div className="player-information">
                                <span className="player-dot player-one-dot" />

                                <div>
                                    <p>Player 1</p>

                                    <h2>
                                        {onlineGameState.players[0].name}
                                    </h2>
                                </div>
                            </div>

                            <strong>
                                {onlineGameState.players[0].score}
                            </strong>
                        </article>

                        <article
                            className={`turn-card ${onlineGameIsComplete
                                ? "game-complete-turn"
                                : onlineGameState.currentPlayer === 1
                                    ? "player-one-turn"
                                    : "player-two-turn"
                                }`}
                            aria-live="polite"
                        >
                            <p>
                                {onlineGameIsComplete
                                    ? "Game status"
                                    : "Current player"}
                            </p>

                            <strong>
                                {onlineGameIsComplete
                                    ? "Complete"
                                    : onlineCurrentPlayer?.name ??
                                    "Unknown player"}
                            </strong>
                        </article>

                        <article
                            className={`player-card ${!onlineGameIsComplete &&
                                onlineGameState.currentPlayer === 2
                                ? "active-player player-two-active"
                                : ""
                                }`}
                        >
                            <div className="player-information">
                                <span className="player-dot player-two-dot" />

                                <div>
                                    <p>Player 2</p>

                                    <h2>
                                        {onlineGameState.players[1].name}
                                    </h2>
                                </div>
                            </div>

                            <strong>
                                {onlineGameState.players[1].score}
                            </strong>
                        </article>
                    </section>

                    {onlineGameIsComplete && (
                        <section
                            className="game-result"
                            aria-live="assertive"
                            aria-labelledby="online-result-heading"
                        >
                            <p className="result-label">
                                Online result
                            </p>

                            <h2 id="online-result-heading">
                                {onlineWinningPlayer
                                    ? `${onlineWinningPlayer.name} wins!`
                                    : "The game ends in a tie!"}
                            </h2>

                            <p className="result-score">
                                {onlineGameState.players[0].name}{" "}
                                <strong>
                                    {onlineGameState.players[0].score}
                                </strong>

                                <span aria-hidden="true">–</span>

                                <strong>
                                    {onlineGameState.players[1].score}
                                </strong>{" "}

                                {onlineGameState.players[1].name}
                            </p>

                            {currentRoomPlayer?.playerNumber === 1 && (
                                <button
                                    className="restart-button"
                                    type="button"
                                    onClick={handleStartOnlineGame}
                                >
                                    Start New Match
                                </button>
                            )}
                        </section>
                    )}

                    <GameBoard
                        gameState={onlineGameState}
                        isGameComplete={onlineGameIsComplete}
                        isInteractionDisabled={!currentBrowserCanMove}
                        onEdgeClick={handleOnlineEdgeClick}
                    />
                </section>
            )}

            <section className="online-next-step-card">
                <p className="online-card-label">
                    Next milestone
                </p>

                <h2>
                    Statistics and deployment begin in Phase 15.
                </h2>

                <p>
                    Online multiplayer now uses authenticated LineLock
                    accounts with server-controlled game state and
                    reconnection recovery.
                </p>

                <div className="online-phase-list">
                    <article className="completed-online-phase">
                        <span>Phase 11</span>
                        <strong>Online Rooms</strong>
                    </article>

                    <article className="completed-online-phase">
                        <span>Phase 12</span>
                        <strong>Server-Controlled State</strong>
                    </article>

                    <article className="completed-online-phase">
                        <span>Phase 13</span>
                        <strong>Reconnection Handling</strong>
                    </article>

                    <article className="completed-online-phase">
                        <span>Phase 14</span>
                        <strong>Authentication & Database</strong>
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