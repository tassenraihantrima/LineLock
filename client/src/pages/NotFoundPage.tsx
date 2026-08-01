import { Link } from "react-router";

function NotFoundPage() {
    return (
        <main className="main-content not-found-page">
            <section className="not-found-card">
                <p className="not-found-code">
                    404
                </p>

                <h1>This route is outside the board.</h1>

                <p>
                    The page you requested does not exist in the current
                    LineLock application.
                </p>

                <div className="not-found-actions">
                    <Link
                        className="primary-page-link"
                        to="/"
                    >
                        Return Home
                    </Link>

                    <Link
                        className="secondary-page-link"
                        to="/local"
                    >
                        Play Local Game
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default NotFoundPage;