import {
    NavLink,
    Outlet,
} from "react-router";

import { useAuth } from "../auth/AuthContext";

import "../App.css";

function AppLayout() {
    // Read the current account so the shared navigation
    // can change between signed-out and signed-in states.
    const {
        user,
        authIsLoading,
    } = useAuth();

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

                {/* Show account navigation after the initial
                    authentication check has finished. */}
                <div className="header-account-actions">
                    {!authIsLoading && !user && (
                        <>
                            <NavLink
                                className={({ isActive }) =>
                                    isActive
                                        ? "navigation-link active-navigation-link"
                                        : "navigation-link"
                                }
                                to="/login"
                            >
                                Log In
                            </NavLink>

                            <NavLink
                                className={({ isActive }) =>
                                    isActive
                                        ? "navigation-link active-navigation-link"
                                        : "navigation-link"
                                }
                                to="/register"
                            >
                                Register
                            </NavLink>
                        </>
                    )}

                    {!authIsLoading && user && (
                        <NavLink
                            className={({ isActive }) =>
                                isActive
                                    ? "navigation-link active-navigation-link"
                                    : "navigation-link"
                            }
                            to="/account"
                        >
                            {user.username}
                        </NavLink>
                    )}

                    <span className="phase-badge">
                        Phase 15
                    </span>
                </div>
            </header>

            {/* The matched page route renders inside this shared layout. */}
            <Outlet />

            <footer className="site-footer">
                <p>
                    Built with React, TypeScript, Express,
                    Socket.IO, PostgreSQL, and Prisma.
                </p>
            </footer>
        </div>
    );
}

export default AppLayout;