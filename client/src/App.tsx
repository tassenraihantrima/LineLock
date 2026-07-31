import { useState } from "react";
import "./App.css";
import GameBoard from "./components/GameBoard";
import { claimEdge } from "./game/gameRules";
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

  // Find the player object matching the active player number.
  const currentPlayer = gameState.players.find(
    (player) =>
      player.number === gameState.currentPlayer,
  );

  // Claim the selected edge for the currently active player.
  function handleEdgeClick(edgeId: string) {
    setGameState((currentGameState) =>
      claimEdge(currentGameState, {
        edgeId,
        player: currentGameState.currentPlayer,
      }),
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
          Phase 6
        </span>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <p className="eyebrow">
            Classic strategy. Modern competition.
          </p>

          <h1>
            Complete boxes and take control of the board.
          </h1>

          <p className="hero-description">
            Close the fourth side of a box to claim it, earn a
            point, and keep control for another move.
          </p>
        </section>

        <section
          className="game-information"
          aria-label="Game information"
        >
          <article
            className={`player-card ${gameState.currentPlayer === 1
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
            className={`turn-card ${gameState.currentPlayer === 1
                ? "player-one-turn"
                : "player-two-turn"
              }`}
            aria-live="polite"
          >
            <p>Current player</p>

            <strong>
              {currentPlayer?.name ?? "Unknown player"}
            </strong>
          </article>

          <article
            className={`player-card ${gameState.currentPlayer === 2
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

        <GameBoard
          gameState={gameState}
          onEdgeClick={handleEdgeClick}
        />

        <section className="phase-message">
          <span aria-hidden="true">i</span>

          <p>
            Completing a box earns one point and grants another
            turn. The game will officially end when every edge is
            claimed in Phase 7.
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