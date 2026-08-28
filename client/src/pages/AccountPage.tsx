import {
    useEffect,
    useState,
} from "react";

import {
    Navigate,
    useNavigate,
} from "react-router";

import {
    getCurrentUser,
    type AuthUser,
} from "../auth/authApi";

import { useAuth } from "../auth/AuthContext";

function AccountPage() {
    const {
        user,
        authIsLoading,
        logout,
    } = useAuth();

    const navigate =
        useNavigate();

    // Keep a fresh copy of the account so newly completed
    // match statistics appear when this page is opened.
    const [
        accountUser,
        setAccountUser,
    ] = useState<AuthUser | null>(
        user,
    );

    const [
        accountIsLoading,
        setAccountIsLoading,
    ] = useState(true);

    // Reload persistent account information from the server.
    useEffect(() => {
        if (!user) {
            setAccountUser(null);
            setAccountIsLoading(false);

            return;
        }

        let requestIsActive =
            true;

        async function loadAccount() {
            try {
                const response =
                    await getCurrentUser();

                if (
                    requestIsActive &&
                    response.success
                ) {
                    setAccountUser(
                        response.user,
                    );
                }
            } finally {
                if (requestIsActive) {
                    setAccountIsLoading(
                        false,
                    );
                }
            }
        }

        void loadAccount();

        return () => {
            requestIsActive =
                false;
        };
    }, [user]);

    async function handleLogout() {
        await logout();

        navigate("/");
    }

    if (
        authIsLoading ||
        accountIsLoading
    ) {
        return (
            <main className="main-content">
                <section className="hero-section">
                    <p className="eyebrow">
                        Player account
                    </p>

                    <h1>
                        Loading your account...
                    </h1>
                </section>
            </main>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const displayedUser =
        accountUser ?? user;

    const winRate =
        displayedUser.gamesPlayed > 0
            ? Math.round(
                (
                    displayedUser.wins /
                    displayedUser.gamesPlayed
                ) *
                100,
            )
            : 0;

    return (
        <main className="main-content auth-page account-page">
            <section className="hero-section auth-hero">
                <p className="eyebrow">
                    Player account
                </p>

                <h1>
                    Welcome, {displayedUser.username}.
                </h1>

                <p className="hero-description">
                    Your LineLock account stores your identity
                    and persistent online match statistics.
                </p>
            </section>

            <section
                className="auth-card account-card"
                aria-labelledby="account-heading"
            >
                <div className="account-section">
                    <div className="auth-card-heading">
                        <p className="online-card-label">
                            Account details
                        </p>

                        <h2 id="account-heading">
                            Your profile
                        </h2>
                    </div>

                    <div className="account-profile-grid">
                        <article className="account-info-card">
                            <span>
                                Username
                            </span>

                            <strong>
                                {displayedUser.username}
                            </strong>
                        </article>

                        <article className="account-info-card">
                            <span>
                                Email
                            </span>

                            <strong>
                                {displayedUser.email}
                            </strong>
                        </article>

                        <article className="account-info-card">
                            <span>
                                Member since
                            </span>

                            <strong>
                                {new Date(
                                    displayedUser.createdAt,
                                ).toLocaleDateString()}
                            </strong>
                        </article>
                    </div>
                </div>

                <div className="account-section account-statistics-section">
                    <div className="auth-card-heading">
                        <p className="online-card-label">
                            Online record
                        </p>

                        <h2>
                            Player statistics
                        </h2>
                    </div>

                    <div className="account-statistics-grid">
                        <article className="account-stat-card">
                            <span>
                                Games played
                            </span>

                            <strong>
                                {displayedUser.gamesPlayed}
                            </strong>
                        </article>

                        <article className="account-stat-card">
                            <span>
                                Wins
                            </span>

                            <strong>
                                {displayedUser.wins}
                            </strong>
                        </article>

                        <article className="account-stat-card">
                            <span>
                                Losses
                            </span>

                            <strong>
                                {displayedUser.losses}
                            </strong>
                        </article>

                        <article className="account-stat-card">
                            <span>
                                Ties
                            </span>

                            <strong>
                                {displayedUser.ties}
                            </strong>
                        </article>

                        <article className="account-stat-card account-win-rate-card">
                            <span>
                                Win rate
                            </span>

                            <strong>
                                {winRate}%
                            </strong>
                        </article>
                    </div>
                </div>

                <div className="account-actions">
                    <button
                        className="leave-room-button"
                        type="button"
                        onClick={handleLogout}
                    >
                        Log Out
                    </button>
                </div>
            </section>
        </main>
    );
}

export default AccountPage;