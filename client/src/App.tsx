import "./App.css";
import GameBoard from "./components/GameBoard";
import { createInitialGameState } from "./game/gameState";

function App() {
  // Create the initial local game that will be displayed on the page.
  const gameState = createInitialGameState(5, "Tassen", "Player 2");

  // Find the active player so the interface can show whose turn it is.
  const currentPlayer = gameState.players.find(
    (player) => player.number === gameState.currentPlayer,
  );

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

        <span className="phase-badge">Phase 3</span>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <p className="eyebrow">Classic strategy. Modern competition.</p>

          <h1>Connect lines and control the board.</h1>

          <p className="hero-description">
            The static LineLock game board is now generated directly from the
            TypeScript models created in Phase 2.
          </p>
        </section>

        <section className="game-information" aria-label="Game information">
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
            <p>Current turn</p>
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

        <GameBoard gameState={gameState} />

        <section className="phase-message">
          <span aria-hidden="true">i</span>

          <p>
            The board is static in this phase. Edge interaction will be added
            in Phase 4.
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