import type {
    ReactNode,
} from "react";

import {
    Navigate,
    useLocation,
} from "react-router";

import { useAuth } from "./AuthContext";

type RequireAuthProps = {
    children: ReactNode;
};

// Protect pages that require a persistent LineLock account.
function RequireAuth({
    children,
}: RequireAuthProps) {
    const {
        user,
        authIsLoading,
    } = useAuth();

    const location = useLocation();

    // Wait for the server to check whether an existing
    // authentication cookie belongs to a valid account.
    if (authIsLoading) {
        return (
            <main className="main-content">
                <section className="hero-section">
                    <p className="eyebrow">
                        Player account
                    </p>

                    <h1>
                        Checking your session...
                    </h1>

                    <p className="hero-description">
                        LineLock is confirming your account
                        before opening online multiplayer.
                    </p>
                </section>
            </main>
        );
    }

    // Signed-out players must log in before using
    // authenticated online multiplayer.
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname,
                }}
            />
        );
    }

    return children;
}

export default RequireAuth;