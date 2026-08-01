import { Link } from "react-router";

function OnlineGamePage() {
    return (
        <main className="main-content online-page">
            <section className="hero-section online-hero">
                <p className="eyebrow">
                    Online multiplayer
                </p>

                <h1>
                    Real-time LineLock is coming next.
                </h1>

                <p className="hero-description">
                    The online route is ready. Socket.IO integration, rooms,
                    and server-controlled game state will be added in the next
                    development phases.
                </p>
            </section>

            <section className="online-roadmap-card">
                <div className="online-status-icon" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>

                <p className="online-card-label">
                    Multiplayer foundation
                </p>

                <h2>The route is ready for connection.</h2>

                <p>
                    This dedicated page will become the entry point for
                    creating rooms, joining matches, and playing against
                    another browser in real time.
                </p>

                <div className="online-phase-list">
                    <article>
                        <span>Phase 10</span>
                        <strong>Socket.IO Integration</strong>
                    </article>

                    <article>
                        <span>Phase 11</span>
                        <strong>Online Rooms</strong>
                    </article>

                    <article>
                        <span>Phase 12</span>
                        <strong>Server-Controlled State</strong>
                    </article>
                </div>

                <Link
                    className="secondary-page-link"
                    to="/local"
                >
                    Play locally for now
                </Link>
            </section>
        </main>
    );
}

export default OnlineGamePage;