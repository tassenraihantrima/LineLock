// Describe the safe account information returned by the server.
export type AuthUser = {
    id: string;
    email: string;
    username: string;

    gamesPlayed: number;
    wins: number;
    losses: number;
    ties: number;

    createdAt: string;
};

// Successful authentication responses include the logged-in user.
export type SuccessfulAuthResponse = {
    success: true;
    user: AuthUser;
};

// Failed authentication responses include a readable message.
export type FailedAuthResponse = {
    success: false;
    message: string;
};

// Represent either kind of authentication response.
export type AuthResponse =
    | SuccessfulAuthResponse
    | FailedAuthResponse;

// Use a deployed backend when one is provided.
// Fall back to the local LineLock server during development.
const API_URL =
    import.meta.env.VITE_SERVER_URL ??
    "http://localhost:3001";

// Send one authentication request to the Express backend.
async function authRequest(
    path: string,
    options?: RequestInit,
): Promise<AuthResponse> {
    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },

            // Include the HTTP-only authentication cookie.
            credentials: "include",
        },
    );

    return response.json();
}

// Create a new persistent LineLock account.
export function registerUser(
    email: string,
    username: string,
    password: string,
): Promise<AuthResponse> {
    return authRequest(
        "/api/auth/register",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                username,
                password,
            }),
        },
    );
}

// Log in using an existing account.
export function loginUser(
    email: string,
    password: string,
): Promise<AuthResponse> {
    return authRequest(
        "/api/auth/login",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                password,
            }),
        },
    );
}

// Ask the server which account is represented
// by the current authentication cookie.
export function getCurrentUser():
    Promise<AuthResponse> {
    return authRequest(
        "/api/auth/me",
    );
}

// Remove the current authentication cookie.
export async function logoutUser():
    Promise<void> {
    await fetch(
        `${API_URL}/api/auth/logout`,
        {
            method: "POST",
            credentials: "include",
        },
    );
}