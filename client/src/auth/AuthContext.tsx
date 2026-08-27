import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    type AuthUser,
} from "./authApi";

import { socket } from "../socket/socket";

// Describe everything authentication provides
// to the rest of the React application.
type AuthContextValue = {
    user: AuthUser | null;
    authIsLoading: boolean;

    register: (
        email: string,
        username: string,
        password: string,
    ) => Promise<string | null>;

    login: (
        email: string,
        password: string,
    ) => Promise<string | null>;

    logout: () => Promise<void>;
};

// Keep authentication state available across all routes.
const AuthContext =
    createContext<AuthContextValue | null>(
        null,
    );

// Provide persistent authentication state to the application.
export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] =
        useState<AuthUser | null>(null);

    const [
        authIsLoading,
        setAuthIsLoading,
    ] = useState(true);

    // Check for an existing authenticated session
    // when the React application first loads.
    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const response =
                    await getCurrentUser();

                if (response.success) {
                    setUser(response.user);
                } else {
                    setUser(null);
                }
            } finally {
                setAuthIsLoading(false);
            }
        }

        void loadCurrentUser();
    }, []);

    // Register a new account and immediately
    // store the authenticated user in React state.
    async function register(
        email: string,
        username: string,
        password: string,
    ): Promise<string | null> {
        const response =
            await registerUser(
                email,
                username,
                password,
            );

        // Failed authentication responses contain a readable message.
        if ("message" in response) {
            return response.message;
        }

        setUser(response.user);

        return null;
    }

    // Log in and store the authenticated account.
    async function login(
        email: string,
        password: string,
    ): Promise<string | null> {
        const response =
            await loginUser(
                email,
                password,
            );

        // Failed authentication responses contain a readable message.
        if ("message" in response) {
            return response.message;
        }

        setUser(response.user);

        return null;
    }

    // Log out of both HTTP authentication and
    // any active Socket.IO multiplayer connection.
    async function logout():
        Promise<void> {
        if (socket.connected) {
            socket.disconnect();
        }

        // Recovery credentials belong to the authenticated player,
        // so clear them when that account logs out.
        sessionStorage.removeItem(
            "linelock:recovery-room-code",
        );

        sessionStorage.removeItem(
            "linelock:recovery-token",
        );

        await logoutUser();

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                authIsLoading,
                register,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Give components a typed way to access authentication state.
export function useAuth():
    AuthContextValue {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider.",
        );
    }

    return context;
}