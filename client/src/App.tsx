import { useState } from "react";
import "./App.css";
import GameBoard from "./components/GameBoard";
import {
  claimEdge,
  isGameComplete,
} from "./game/gameRules";
import { createInitialGameState } from "./game/gameState";

function App() {
  // Store the complete local game state inside the application.
  const [gameState, setGameState] = useState(() =>
    createInitialGameState(
      5,
      "Tassen",
      "Player 2",
    ),
  );

  // Determine whether all edges have been claimed.
  const gameIsComplete = isGameComplete(gameState);

  // Find the player object matching the active player number.
  const currentPlayer = gameState.players.find(
    (player) =>
      player.number === gameState.currentPlayer,
  );

  // Compare the final scores to determine the winner.
  const winningPlayer =
    gameState.players[0].score >
      gameState.players[1].score
      ? gameState.players[0]
      : gameState.players[1].score >
        gameState.players[0].score
        ? gameState.players[1]
        : null;

  // Claim the selected edge for the currently active player.
  function handleEdgeClick(edgeId: string) {
    setGameState((currentGameState) =>
      claimEdge(currentGameState, {
        edgeId,
        player: currentGameState.currentPlayer,
      }),
    );
  }

  // Create a new game using the original board and player settings.
  function handleRestartGame() {
    setGameState(
      createInitialGameState(
        5,
        "Tassen",
        "Player 2",
      ),
    );
  }

  return (
    <div className="app">
      <header className="site-header">
        <a
          className="brand"
          href="/"
          aria-label="LineLock home"
        >
          <span
            className="brand-mark"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
            <span />
          </span>

          <span>LineLock</span>
        </a>

        <span className="phase-badge">
          Phase 7
        </span>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <p className="eyebrow">
            Classic strategy. Modern competition.
          </p>

          <h1>
            Finish the board and claim the victory.
          </h1>

          <p className="hero-description">
            Every completed box adds to the final score. Once all
            edges are claimed, LineLock announces the winner or tie.
          </p>
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

                <h2>
                  {gameState.players[0].name}
                </h2>
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

                <h2>
                  {gameState.players[1].name}
                </h2>
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
              onClick={handleRestartGame}
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
            The match ends after all 40 edges are claimed. LineLock
            then compares both scores, announces the result, and
            allows the players to begin a new game.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Built with React, TypeScript, Express, and Socket.IO.
        </p>
      </footer>
    </div>
  );
}

export default App;