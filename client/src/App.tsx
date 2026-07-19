import "./App.css";
import { createInitialGameState } from "./game/gameState";

function App() {
  // Create a temporary game state 
  const gameState = createInitialGameState(5, "Tassen", "Player 2");

  return (
    <main className="phase-two-page">
      <section className="phase-two-card">
        <p className="phase-label">LineLock Development</p>

        <h1>Phase 2: Game Models & Rules</h1>

        <p className="phase-description">
          The game now has typed players, edges, boxes, board-generation
          helpers, and move-validation rules.
        </p>

        {/* Show the generated values to verify the game structure. */}
        <div className="model-summary">
          <article>
            <span>Board size</span>
            <strong>
              {gameState.boardSize} × {gameState.boardSize} dots
            </strong>
          </article>

          <article>
            <span>Players</span>
            <strong>{gameState.players.length}</strong>
          </article>

          <article>
            <span>Edges</span>
            <strong>{gameState.edges.length}</strong>
          </article>

          <article>
            <span>Boxes</span>
            <strong>{gameState.boxes.length}</strong>
          </article>

          <article>
            <span>Current player</span>
            <strong>{gameState.players[0].name}</strong>
          </article>

          <article>
            <span>Status</span>
            <strong>{gameState.status}</strong>
          </article>
        </div>

        {/* The actual board interface will be created in the next phase. */}
        <p className="phase-note">
          The visual game board will be built in Phase 3.
        </p>
      </section>
    </main>
  );
}

export default App;