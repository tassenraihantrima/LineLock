import "./App.css";

function App() {
  return (
    <main className="app">
      {/* This section introduces the game before the board is built. */}
      <section className="hero">
        <p className="eyebrow">Classic strategy. Modern competition.</p>

        <h1>LineLock</h1>

        <p className="description">
          A real-time multiplayer version of the classic Dots and Boxes
          strategy game.
        </p>

        {/* These buttons are placeholders for future game modes. */}
        <div className="actions">
          <button type="button" className="primary-button">
            Play Local
          </button>

          <button type="button" className="secondary-button">
            Play Online
          </button>
        </div>

        <p className="phase-label">Phase 1: Project foundation complete</p>
      </section>
    </main>
  );
}

export default App;