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
                    LineLock transforms the classic Dots and Boxes game into
                    a responsive web experience with local play and future
                    real-time multiplayer.
                </p>

                <div className="hero-actions">
                    <Link
                        className="primary-page-link"
                        to="/local"
                    >
                        Play Local Game
                    </Link>

                    <Link
                        className="secondary-page-link"
                        to="/online"
                    >
                        Explore Online Mode
                    </Link>
                </div>
            </section>

            <section
                className="game-mode-grid"
                aria-label="LineLock game modes"
            >
                <article className="game-mode-card available-mode-card">
                    <span className="mode-status available-status">
                        Available
                    </span>

                    <p className="mode-label">
                        Same-device competition
                    </p>

                    <h2>Local Game</h2>

                    <p>
                        Choose player names and board size, then compete on one
                        device with complete scoring, extra turns, winner
                        detection, and restart controls.
                    </p>

                    <ul className="mode-feature-list">
                        <li>Configurable player names</li>
                        <li>Five selectable board sizes</li>
                        <li>Complete Dots and Boxes rules</li>
                    </ul>

                    <Link
                        className="mode-card-link"
                        to="/local"
                    >
                        Start local match
                        <span aria-hidden="true">→</span>
                    </Link>
                </article>

                <article className="game-mode-card upcoming-mode-card">
                    <span className="mode-status upcoming-status">
                        Coming next
                    </span>

                    <p className="mode-label">
                        Real-time competition
                    </p>

                    <h2>Online Game</h2>

                    <p>
                        Create or join a multiplayer room and synchronize moves
                        with another player through the LineLock server.
                    </p>

                    <ul className="mode-feature-list">
                        <li>Socket.IO connection</li>
                        <li>Shareable game rooms</li>
                        <li>Server-controlled game state</li>
                    </ul>

                    <Link
                        className="mode-card-link"
                        to="/online"
                    >
                        View online roadmap
                        <span aria-hidden="true">→</span>
                    </Link>
                </article>
            </section>

            <section className="how-to-play-section">
                <div className="section-heading">
                    <p className="eyebrow">How to play</p>
                    <h2>Simple rules. Strategic decisions.</h2>
                </div>

                <div className="instruction-grid">
                    <article>
                        <span>01</span>
                        <h3>Claim an edge</h3>
                        <p>
                            Players take turns selecting one available line
                            between two neighboring dots.
                        </p>
                    </article>

                    <article>
                        <span>02</span>
                        <h3>Complete a box</h3>
                        <p>
                            Close the fourth side of a box to claim it, score one
                            point, and receive another move.
                        </p>
                    </article>

                    <article>
                        <span>03</span>
                        <h3>Win the board</h3>
                        <p>
                            When every edge is claimed, the player who controls
                            the most boxes wins.
                        </p>
                    </article>
                </div>
            </section>
        </main>
    );
}

export default HomePage;