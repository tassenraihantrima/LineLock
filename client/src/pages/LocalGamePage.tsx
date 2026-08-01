import { useState } from "react";
import GameBoard from "../components/GameBoard";
import LocalGameSetup from "../components/LocalGameSetup";
import type { LocalGameSettings } from "../components/LocalGameSetup";
import {
    claimEdge,
    isGameComplete,
} from "../game/gameRules";
import { createInitialGameState } from "../game/gameState";

// Define the settings displayed when the local page first opens.
const DEFAULT_GAME_SETTINGS: LocalGameSettings = {
    playerOneName: "Player 1",
    playerTwoName: "Player 2",
    boardSize: 5,
};

function LocalGamePage() {
    // Preserve selected settings for restarts and setup changes.
    const [gameSettings, setGameSettings] = useState(
        DEFAULT_GAME_SETTINGS,
    );

    // Keep the setup screen visible until a match is started.
    const [gameHasStarted, setGameHasStarted] = useState(false);

    // Create an initial state that is replaced when setup is submitted.
    const [gameState, setGameState] = useState(() =>
        createInitialGameState(
            DEFAULT_GAME_SETTINGS.boardSize,
            DEFAULT_GAME_SETTINGS.playerOneName,
            DEFAULT_GAME_SETTINGS.playerTwoName,
        ),
    );

    // Describe the latest gameplay event to both visual users and screen readers.
    const [feedbackMessage, setFeedbackMessage] = useState(
        "Choose your players and board size to begin.",
    );

    // Derive completion from the current game state.
    const gameIsComplete = isGameComplete(gameState);

    // Locate the player whose turn is active.
    const currentPlayer = gameState.players.find(
        (player) =>
            player.number === gameState.currentPlayer,
    );

    // Compare both scores to determine the final winner.
    const winningPlayer =
        gameState.players[0].score >
            gameState.players[1].score
            ? gameState.players[0]
            : gameState.players[1].score >
                gameState.players[0].score
                ? gameState.players[1]
                : null;

    // Create a fresh match using the submitted settings.
    function handleStartGame(settings: LocalGameSettings) {
        setGameSettings(settings);

        setGameState(
            createInitialGameState(
                settings.boardSize,
                settings.playerOneName,
                settings.playerTwoName,
            ),
        );

        setFeedbackMessage(
            `${settings.playerOneName} begins the match.`,
        );

        setGameHasStarted(true);
    }

    // Claim an edge and generate feedback from the state change.
    function handleEdgeClick(edgeId: string) {
        setGameState((currentGameState) => {
            // Store the moving player before applying the move.
            const movingPlayer =
                currentGameState.players.find(
                    (player) =>
                        player.number ===
                        currentGameState.currentPlayer,
                );

            if (!movingPlayer) {
                return currentGameState;
            }

            const updatedGameState = claimEdge(
                currentGameState,
                {
                    edgeId,
                    player: currentGameState.currentPlayer,
                },
            );

            // Invalid moves return the original object unchanged.
            if (updatedGameState === currentGameState) {
                return currentGameState;
            }

            // Compare scores to determine how many boxes the move completed.
            const updatedMovingPlayer =
                updatedGameState.players.find(
                    (player) =>
                        player.number === movingPlayer.number,
                );

            const completedBoxCount =
                (updatedMovingPlayer?.score ??
                    movingPlayer.score) -
                movingPlayer.score;

            if (
                updatedGameState.moveCount >=
                updatedGameState.edges.length
            ) {
                setFeedbackMessage(
                    "Every edge has been claimed. The final result is ready.",
                );
            } else if (completedBoxCount > 0) {
                const boxWord =
                    completedBoxCount === 1 ? "box" : "boxes";

                setFeedbackMessage(
                    `${movingPlayer.name} completed ${completedBoxCount} ${boxWord} and keeps the turn.`,
                );
            } else {
                const nextPlayer =
                    updatedGameState.players.find(
                        (player) =>
                            player.number ===
                            updatedGameState.currentPlayer,
                    );

                setFeedbackMessage(
                    `${movingPlayer.name} claimed an edge. ${nextPlayer?.name ?? "The next player"
                    } now has control.`,
                );
            }

            return updatedGameState;
        });
    }

    // Reset gameplay while preserving player names and board size.
    function handleRestartMatch() {
        setGameState(
            createInitialGameState(
                gameSettings.boardSize,
                gameSettings.playerOneName,
                gameSettings.playerTwoName,
            ),
        );

        setFeedbackMessage(
            `${gameSettings.playerOneName} begins the restarted match.`,
        );
    }

    // Return to the setup form without losing its previous selections.
    function handleChangeSettings() {
        setGameHasStarted(false);

        setFeedbackMessage(
            "Update the local match settings before starting again.",
        );
    }

    return (
        <main className="main-content local-game-page">
            <section className="hero-section local-game-hero">
                <p className="eyebrow">
                    Local competition
                </p>

                <h1>
                    {gameHasStarted
                        ? "Build your strategy and control the board."
                        : "Set up a local LineLock match."}
                </h1>

                <p className="hero-description">
                    {gameHasStarted
                        ? "Claim edges, complete boxes, and outscore your opponent in a polished local match."
                        : "Choose player names and a board size, then compete together on one device."}
                </p>
            </section>

            {!gameHasStarted ? (
                <LocalGameSetup
                    initialSettings={gameSettings}
                    onStartGame={handleStartGame}
                />
            ) : (
                <>
                    <section
                        className="match-control-bar"
                        aria-label="Match controls"
                    >
                        <div className="match-summary">
                            <p>Current match</p>

                            <strong>
                                {gameSettings.playerOneName} vs.{" "}
                                {gameSettings.playerTwoName}
                            </strong>

                            <span>
                                {gameSettings.boardSize} ×{" "}
                                {gameSettings.boardSize} dots ·{" "}
                                {gameState.boxes.length} boxes
                            </span>
                        </div>

                        <div className="match-control-actions">
                            <button
                                className="secondary-control-button"
                                type="button"
                                onClick={handleRestartMatch}
                            >
                                Restart Match
                            </button>

                            <button
                                className="secondary-control-button"
                                type="button"
                                onClick={handleChangeSettings}
                            >
                                Change Setup
                            </button>
                        </div>
                    </section>

                    <section
                        className="game-feedback"
                        aria-live="polite"
                    >
                        <span aria-hidden="true">i</span>
                        <p>{feedbackMessage}</p>
                    </section>

                    <section
                        className="game-information"
                        aria-label="Game information"
                    >
                        <article
                            className={`player-card ${!gameIsComplete &&
                                    gameState.currentPlayer === 1
                                    ? "active-player player-one-active"
                                    : ""
                                }`}
                        >
                            <div className="player-information">
                                <span className="player-dot player-one-dot" />

                                <div>
                                    <p>Player 1</p>
                                    <h2>{gameState.players[0].name}</h2>
                                </div>
                            </div>

                            <strong>
                                {gameState.players[0].score}
                            </strong>
                        </article>

                        <article
                            className={`turn-card ${gameIsComplete
                                    ? "game-complete-turn"
                                    : gameState.currentPlayer === 1
                                        ? "player-one-turn"
                                        : "player-two-turn"
                                }`}
                            aria-live="polite"
                        >
                            <p>
                                {gameIsComplete
                                    ? "Game status"
                                    : "Current player"}
                            </p>

                            <strong>
                                {gameIsComplete
                                    ? "Complete"
                                    : currentPlayer?.name ??
                                    "Unknown player"}
                            </strong>
                        </article>

                        <article
                            className={`player-card ${!gameIsComplete &&
                                    gameState.currentPlayer === 2
                                    ? "active-player player-two-active"
                                    : ""
                                }`}
                        >
                            <div className="player-information">
                                <span className="player-dot player-two-dot" />

                                <div>
                                    <p>Player 2</p>
                                    <h2>{gameState.players[1].name}</h2>
                                </div>
                            </div>

                            <strong>
                                {gameState.players[1].score}
                            </strong>
                        </article>
                    </section>

                    {gameIsComplete && (
                        <section
                            className="game-result"
                            aria-live="assertive"
                            aria-labelledby="game-result-heading"
                        >
                            <p className="result-label">
                                Final result
                            </p>

                            <h2 id="game-result-heading">
                                {winningPlayer
                                    ? `${winningPlayer.name} wins!`
                                    : "The game ends in a tie!"}
                            </h2>

                            <p className="result-score">
                                {gameState.players[0].name}{" "}
                                <strong>
                                    {gameState.players[0].score}
                                </strong>

                                <span aria-hidden="true">–</span>

                                <strong>
                                    {gameState.players[1].score}
                                </strong>{" "}

                                {gameState.players[1].name}
                            </p>

                            <p className="result-description">
                                {winningPlayer
                                    ? `${winningPlayer.name} claimed the most boxes and takes control of the board.`
                                    : "Both players claimed the same number of boxes."}
                            </p>

                            <button
                                className="restart-button"
                                type="button"
                                onClick={handleRestartMatch}
                            >
                                Play Again
                            </button>
                        </section>
                    )}

                    <GameBoard
                        gameState={gameState}
                        isGameComplete={gameIsComplete}
                        onEdgeClick={handleEdgeClick}
                    />

                    <section className="phase-message">
                        <span aria-hidden="true">i</span>

                        <p>
                            Restart the current match at any time or return to
                            setup to change player names and board size.
                        </p>
                    </section>
                </>
            )}
        </main>
    );
}

export default LocalGamePage;