import {
    Navigate,
    useNavigate,
} from "react-router";

import { useAuth } from "../auth/AuthContext";

function AccountPage() {
    // Access the authenticated account and logout action.
    const {
        user,
        authIsLoading,
        logout,
    } = useAuth();

    const navigate = useNavigate();

    // Prevent duplicate logout requests.
    async function handleLogout() {
        await logout();

        navigate("/");
    }

    // Wait until the application finishes checking
    // whether an authenticated session exists.
    if (authIsLoading) {
        return (
            <main className="main-content">
                <section className="hero-section">
                    <p className="eyebrow">
                        Player account
                    </p>

                    <h1>Loading your account...</h1>
                </section>
            </main>
        );
    }

    // The account page is only available to authenticated users.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <main className="main-content auth-page">
            <section className="hero-section auth-hero">
                <p className="eyebrow">
                    Player account
                </p>

                <h1>
                    Welcome, {user.username}.
                </h1>

                <p className="hero-description">
                    Your LineLock identity is stored persistently and can
                    now be connected to authenticated online multiplayer.
                </p>
            </section>

            <section
                className="auth-card account-card"
                aria-labelledby="account-heading"
            >
                <div className="auth-card-heading">
                    <p className="online-card-label">
                        Account details
                    </p>

                    <h2 id="account-heading">
                        Your profile
                    </h2>
                </div>

                <div className="account-detail-list">
                    <article>
                        <span>Username</span>

                        <strong>
                            {user.username}
                        </strong>
                    </article>

                    <article>
                        <span>Email</span>

                        <strong>
                            {user.email}
                        </strong>
                    </article>

                    <article>
                        <span>Member since</span>

                        <strong>
                            {new Date(
                                user.createdAt,
                            ).toLocaleDateString()}
                        </strong>
                    </article>
                </div>

                <button
                    className="leave-room-button"
                    type="button"
                    onClick={handleLogout}
                >
                    Log Out
                </button>
            </section>
        </main>
    );
}

export default AccountPage;