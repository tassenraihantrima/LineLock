import {
    useEffect,
    useState,
    type SubmitEvent,
} from "react";

import GameBoard from "../components/GameBoard";

import {
    socket,
    type ConnectionReadyPayload,
    type OnlineRoom,
    type RoomActionResponse,
} from "../socket/socket";

// Represent every connection state needed by the online page.
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
    // Track whether the real-time server is available.
    const [
        connectionStatus,
        setConnectionStatus,
    ] = useState<ConnectionStatus>("connecting");

    // Store the identifier assigned to this socket connection.
    const [socketId, setSocketId] = useState<string | null>(
        null,
    );

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

        // Update connection state when Socket.IO connects.
        function handleConnect() {
            setConnectionStatus("connected");
            setSocketId(socket.id ?? null);

            attemptRoomRecovery();
        }

        // Preserve recovery information when the connection drops.
        function handleDisconnect() {
            setConnectionStatus("disconnected");
            setSocketId(null);
            setRoomActionIsPending(false);

            const recoveryCredentials =
                getRecoveryCredentials();

            setRoomMessage(
                recoveryCredentials
                    ? "Connection interrupted. Your room position is being preserved while LineLock reconnects."
                    : "Connection interrupted. LineLock is reconnecting.",
            );
        }

        // Display a simple player-facing message if connection fails.
        function handleConnectError() {
            setConnectionStatus("error");
            setSocketId(null);
            setRoomActionIsPending(false);

            setRoomMessage(
                "Unable to connect to the game server. Please try again shortly.",
            );
        }

        // Store the server-confirmed socket identifier.
        function handleConnectionReady(
            payload: ConnectionReadyPayload,
        ) {
            setConnectionStatus("connected");
            setSocketId(payload.socketId);
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

            socket.off("room:updated", handleRoomUpdated);
            socket.off("game:updated", handleGameUpdated);

            socket.disconnect();
        };
    }, []);

    // Create a new room using the authenticated account.
    function handleCreateRoom() {
        if (!socket.connected) {
            setRoomMessage(
                "The game server is reconnecting. Please try again shortly.",
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
                "The game server is reconnecting. Please try again shortly.",
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

    const serverIsAvailable =
        connectionStatus === "connected";

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
                    Create or join a private room and compete against
                    another player in real time.
                </p>
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

                            <h3>
                                Create a new room
                            </h3>

                            <p>
                                Generate a private room and wait for one opponent.
                            </p>

                            <button
                                className="socket-primary-button"
                                type="button"
                                disabled={
                                    !serverIsAvailable ||
                                    roomActionIsPending
                                }
                                onClick={handleCreateRoom}
                            >
                                {roomActionIsPending
                                    ? "Creating Room..."
                                    : !serverIsAvailable
                                        ? "Connecting..."
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

                            <h3>
                                Enter a room code
                            </h3>

                            <label className="online-room-field">
                                <span>
                                    Six-character code
                                </span>

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
                                    !serverIsAvailable ||
                                    roomActionIsPending
                                }
                            >
                                {roomActionIsPending
                                    ? "Joining Room..."
                                    : !serverIsAvailable
                                        ? "Connecting..."
                                        : "Join Room"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="active-room-content">
                        <section className="room-code-panel">
                            <p>
                                Room code
                            </p>

                            <strong>
                                {activeRoom.roomCode}
                            </strong>

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
                        <span aria-hidden="true">
                            i
                        </span>

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
                                    <p>
                                        Player 1
                                    </p>

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
                                    <p>
                                        Player 2
                                    </p>

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

                                <span aria-hidden="true">
                                    –
                                </span>

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
        </main>
    );
}

export default OnlineGamePage;