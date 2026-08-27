import {
    useState,
    type SubmitEvent,
} from "react";
import {
    Link,
    Navigate,
    useNavigate,
} from "react-router";

import { useAuth } from "../auth/AuthContext";

function LoginPage() {
    // Access the current authentication state and login action.
    const {
        user,
        authIsLoading,
        login,
    } = useAuth();

    const navigate = useNavigate();

    // Store the values entered into the login form.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Display authentication errors returned by the server.
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    // Prevent duplicate login requests while one is running.
    const [loginIsPending, setLoginIsPending] =
        useState(false);

    // Submit the login credentials to the LineLock server.
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErrorMessage(null);
        setLoginIsPending(true);

        try {
            const error = await login(
                email,
                password,
            );

            if (error) {
                setErrorMessage(error);
                return;
            }

            // Send the authenticated player to their account page.
            navigate("/account");
        } finally {
            setLoginIsPending(false);
        }
    }

    // Wait until the initial authentication check finishes.
    if (authIsLoading) {
        return (
            <main className="main-content">
                <section className="hero-section">
                    <p className="eyebrow">
                        Player account
                    </p>

                    <h1>Checking your session...</h1>
                </section>
            </main>
        );
    }

    // Logged-in players do not need the login form.
    if (user) {
        return <Navigate to="/account" replace />;
    }

    return (
        <main className="main-content auth-page">
            <section className="hero-section auth-hero">
                <p className="eyebrow">
                    Player account
                </p>

                <h1>Welcome back to LineLock.</h1>

                <p className="hero-description">
                    Sign in to access your player account and authenticated
                    online multiplayer.
                </p>
            </section>

            <section
                className="auth-card"
                aria-labelledby="login-heading"
            >
                <div className="auth-card-heading">
                    <p className="online-card-label">
                        Sign in
                    </p>

                    <h2 id="login-heading">
                        Log in to your account
                    </h2>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label className="auth-field">
                        <span>Email</span>

                        <input
                            type="email"
                            value={email}
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            onChange={(event) => {
                                setEmail(event.target.value);
                            }}
                        />
                    </label>

                    <label className="auth-field">
                        <span>Password</span>

                        <input
                            type="password"
                            value={password}
                            autoComplete="current-password"
                            required
                            placeholder="Enter your password"
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                        />
                    </label>

                    {errorMessage && (
                        <p
                            className="auth-error-message"
                            role="alert"
                        >
                            {errorMessage}
                        </p>
                    )}

                    <button
                        className="socket-primary-button"
                        type="submit"
                        disabled={loginIsPending}
                    >
                        {loginIsPending
                            ? "Signing In..."
                            : "Sign In"}
                    </button>
                </form>

                <p className="auth-switch-message">
                    New to LineLock?{" "}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default LoginPage;