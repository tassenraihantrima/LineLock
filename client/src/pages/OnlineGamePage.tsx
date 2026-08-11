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

    // Store the player's lobby name.
    const [playerName, setPlayerName] = useState("");

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
        // Update the page when the socket connection opens.
        function handleConnect() {
            setConnectionStatus("connected");
            setSocketId(socket.id ?? null);

            setServerMessage(
                "Connected. Waiting for server confirmation.",
            );
        }

        // Clear room information after disconnection.
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

    // Create a new room.
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

    // Join an existing room.
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
                                            className={`room-player-state ${!roomPlayer
                                                    ? "waiting-player-state"
                                                    : ""
                                                }`}
                                        >
                                            {roomPlayer
                                                ? "Connected"
                                                : "Waiting"}
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
                            currentRoomPlayer?.playerNumber === 1 && (
                                <button
                                    className="start-online-game-button"
                                    type="button"
                                    disabled={roomActionIsPending}
                                    onClick={handleStartOnlineGame}
                                >
                                    {roomActionIsPending
                                        ? "Starting Match..."
                                        : "Start Online Match"}
                                </button>
                            )}

                        {activeRoom.status === "ready" &&
                            currentRoomPlayer?.playerNumber === 2 && (
                                <p className="waiting-for-host-message">
                                    Waiting for Player 1 to start the match.
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
                    Reconnection handling begins in Phase 13.
                </h2>

                <p>
                    Online game state now lives on the server and remains
                    synchronized between both connected browsers. The next
                    phase will preserve player positions during temporary
                    disconnections.
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

                    <article className="completed-online-phase">
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