import { NavLink, Outlet } from "react-router";
import "../App.css";

function AppLayout() {
    return (
        <div className="app">
            <header className="site-header">
                {/* The brand returns visitors to the main landing page. */}
                <NavLink
                    className="brand"
                    to="/"
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
                </NavLink>

                {/* NavLink provides active-page information for navigation styling. */}
                <nav
                    className="site-navigation"
                    aria-label="Primary navigation"
                >
                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? "navigation-link active-navigation-link"
                                : "navigation-link"
                        }
                        to="/"
                        end
                    >
                        Home
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? "navigation-link active-navigation-link"
                                : "navigation-link"
                        }
                        to="/local"
                    >
                        Local Game
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? "navigation-link active-navigation-link"
                                : "navigation-link"
                        }
                        to="/online"
                    >
                        Online
                    </NavLink>
                </nav>

                <span className="phase-badge">
                    Phase 12
                </span>
            </header>

            {/* The matched page route renders inside this shared layout. */}
            <Outlet />

            <footer className="site-footer">
                <p>
                    Built with React, TypeScript, Express, and Socket.IO.
                </p>
            </footer>
        </div>
    );
}

export default AppLayout;