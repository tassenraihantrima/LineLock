import { Link } from "react-router";

function HomePage() {
    return (
        <main className="main-content home-page">
            <section className="hero-section home-hero">
                <p className="eyebrow">
                    Classic strategy. Modern competition.
                </p>

                <h1>
                    Draw the lines. Claim the boxes. Control the board.
                </h1>

                <p className="hero-description">
                    LineLock brings Dots and Boxes to the web with
                    configurable local play, authenticated real-time
                    multiplayer, persistent player statistics, and
                    server-controlled game state.
                </p>

                <div className="hero-actions">
                    <Link
                        className="primary-page-link"
                        to="/online"
                    >
                        Play Online
                    </Link>

                    <Link
                        className="secondary-page-link"
                        to="/local"
                    >
                        Play Local
                    </Link>
                </div>
            </section>

            <section
                className="game-mode-grid"
                aria-label="LineLock game modes"
            >
                <article className="game-mode-card available-mode-card">
                    <span className="mode-status available-status">
                        Local
                    </span>

                    <p className="mode-label">
                        Same-device competition
                    </p>

                    <h2>
                        Local Game
                    </h2>

                    <p>
                        Play a complete Dots and Boxes match on one device
                        with configurable players, multiple board sizes,
                        automatic scoring, extra turns, and winner detection.
                    </p>

                    <ul className="mode-feature-list">
                        <li>
                            Configurable player names
                        </li>

                        <li>
                            Five selectable board sizes
                        </li>

                        <li>
                            Complete Dots and Boxes rules
                        </li>
                    </ul>

                    <Link
                        className="mode-card-link"
                        to="/local"
                    >
                        Start local match
                        <span aria-hidden="true">
                            →
                        </span>
                    </Link>
                </article>

                <article className="game-mode-card upcoming-mode-card">
                    <span className="mode-status upcoming-status">
                        Online
                    </span>

                    <p className="mode-label">
                        Real-time competition
                    </p>

                    <h2>
                        Online Game
                    </h2>

                    <p>
                        Sign in, create or join a private room, and compete
                        against another player through a synchronized,
                        server-authoritative match.
                    </p>

                    <ul className="mode-feature-list">
                        <li>
                            Authenticated player accounts
                        </li>

                        <li>
                            Real-time Socket.IO synchronization
                        </li>

                        <li>
                            Reconnection and room recovery
                        </li>
                    </ul>

                    <Link
                        className="mode-card-link"
                        to="/online"
                    >
                        Play online
                        <span aria-hidden="true">
                            →
                        </span>
                    </Link>
                </article>
            </section>

            <section className="how-to-play-section">
                <div className="section-heading">
                    <p className="eyebrow">
                        How to play
                    </p>

                    <h2>
                        Simple rules. Strategic decisions.
                    </h2>
                </div>

                <div className="instruction-grid">
                    <article>
                        <span>
                            01
                        </span>

                        <h3>
                            Claim an edge
                        </h3>

                        <p>
                            Players take turns selecting one available line
                            between two neighboring dots.
                        </p>
                    </article>

                    <article>
                        <span>
                            02
                        </span>

                        <h3>
                            Complete a box
                        </h3>

                        <p>
                            Close the fourth side of a box to claim it,
                            score one point, and receive another move.
                        </p>
                    </article>

                    <article>
                        <span>
                            03
                        </span>

                        <h3>
                            Win the board
                        </h3>

                        <p>
                            When every edge is claimed, the player who
                            controls the most boxes wins.
                        </p>
                    </article>
                </div>
            </section>

            <section className="project-feature-section">
                <div className="section-heading">
                    <p className="eyebrow">
                        Built for real-time play
                    </p>

                    <h2>
                        Full-stack multiplayer architecture.
                    </h2>
                </div>

                <div className="instruction-grid">
                    <article>
                        <span>
                            01
                        </span>

                        <h3>
                            Server-authoritative gameplay
                        </h3>

                        <p>
                            Online moves, turns, scores, completed boxes,
                            and match results are validated and controlled
                            by the server.
                        </p>
                    </article>

                    <article>
                        <span>
                            02
                        </span>

                        <h3>
                            Persistent accounts
                        </h3>

                        <p>
                            PostgreSQL-backed accounts provide authenticated
                            multiplayer identities and persistent player
                            statistics.
                        </p>
                    </article>

                    <article>
                        <span>
                            03
                        </span>

                        <h3>
                            Connection recovery
                        </h3>

                        <p>
                            Temporary disconnections preserve player
                            positions and active game state during a
                            reconnection grace period.
                        </p>
                    </article>
                </div>
            </section>
        </main>
    );
}

export default HomePage;