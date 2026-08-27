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

function RegisterPage() {
    // Access the current authentication state and registration action.
    const {
        user,
        authIsLoading,
        register,
    } = useAuth();

    const navigate = useNavigate();

    // Store the values entered into the registration form.
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Display validation or server errors to the player.
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    // Prevent duplicate registration requests.
    const [
        registrationIsPending,
        setRegistrationIsPending,
    ] = useState(false);

    // Submit a new persistent LineLock account.
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setErrorMessage(null);
        setRegistrationIsPending(true);

        try {
            const error = await register(
                email,
                username,
                password,
            );

            if (error) {
                setErrorMessage(error);
                return;
            }

            // Newly registered users are already authenticated.
            navigate("/account");
        } finally {
            setRegistrationIsPending(false);
        }
    }

    // Wait until the application finishes checking
    // whether an authenticated session already exists.
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

    // Logged-in players do not need to create another account.
    if (user) {
        return <Navigate to="/account" replace />;
    }

    return (
        <main className="main-content auth-page">
            <section className="hero-section auth-hero">
                <p className="eyebrow">
                    Player account
                </p>

                <h1>Create your LineLock account.</h1>

                <p className="hero-description">
                    Register a persistent player identity for authenticated
                    online multiplayer and future match statistics.
                </p>
            </section>

            <section
                className="auth-card"
                aria-labelledby="register-heading"
            >
                <div className="auth-card-heading">
                    <p className="online-card-label">
                        Registration
                    </p>

                    <h2 id="register-heading">
                        Create an account
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
                        <span>Username</span>

                        <input
                            type="text"
                            value={username}
                            autoComplete="username"
                            minLength={3}
                            maxLength={20}
                            required
                            placeholder="Choose a username"
                            onChange={(event) => {
                                setUsername(event.target.value);
                            }}
                        />
                    </label>

                    <label className="auth-field">
                        <span>Password</span>

                        <input
                            type="password"
                            value={password}
                            autoComplete="new-password"
                            minLength={8}
                            required
                            placeholder="At least 8 characters"
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
                        disabled={registrationIsPending}
                    >
                        {registrationIsPending
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch-message">
                    Already have an account?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default RegisterPage;