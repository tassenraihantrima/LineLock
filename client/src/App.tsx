import { useState } from "react";
import "./App.css";
import GameBoard from "./components/GameBoard";
import { claimEdge } from "./game/gameRules";
import { createInitialGameState } from "./game/gameState";

function App() {
  // Store the current game state so edge clicks can update the interface.
  const [gameState, setGameState] = useState(() =>
    createInitialGameState(5, "Tassen", "Player 2"),
  );

  // Find the active player so the interface can show whose turn it is.
  const currentPlayer = gameState.players.find(
    (player) => player.number === gameState.currentPlayer,
  );

  // Claim the selected edge for the current player.
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
        <a className="brand" href="/" aria-label="LineLock home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>

          <span>LineLock</span>
        </a>

        <span className="phase-badge">Phase 4</span>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <p className="eyebrow">
            Classic strategy. Modern competition.
          </p>

          <h1>Choose an edge and begin controlling the board.</h1>

          <p className="hero-description">
            Every horizontal and vertical edge is now connected to the
            TypeScript game state and can be claimed by a player.
          </p>
        </section>

        <section
          className="game-information"
          aria-label="Game information"
        >
          <article className="player-card active-player">
            <div className="player-information">
              <span className="player-dot player-one-dot" />

              <div>
                <p>Player 1</p>
                <h2>{gameState.players[0].name}</h2>
              </div>
            </div>

            <strong>{gameState.players[0].score}</strong>
          </article>

          <article className="turn-card">
            <p>Current player</p>
            <strong>{currentPlayer?.name ?? "Player 1"}</strong>
          </article>

          <article className="player-card">
            <div className="player-information">
              <span className="player-dot player-two-dot" />

              <div>
                <p>Player 2</p>
                <h2>{gameState.players[1].name}</h2>
              </div>
            </div>

            <strong>{gameState.players[1].score}</strong>
          </article>
        </section>

        <GameBoard
          gameState={gameState}
          onEdgeClick={handleEdgeClick}
        />

        <section className="phase-message">
          <span aria-hidden="true">i</span>

          <p>
            Click any available edge to claim it. All moves currently
            belong to Player 1 because player-turn switching will be added
            in Phase 5.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <p>Built with React, TypeScript, Express, and Socket.IO.</p>
      </footer>
    </div>
  );
}

export default App;