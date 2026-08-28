// The user information that is safe to send back to the client.
//
// Password hashes and private authentication data are never
// included in this public account type.
export type PublicUser = {
    id: string;
    email: string;
    username: string;

    gamesPlayed: number;
    wins: number;
    losses: number;
    ties: number;

    createdAt: string;
};

// Data expected when a new user creates an account.
export type RegisterPayload = {
    email: string;
    username: string;
    password: string;
};

// Data expected when an existing user logs in.
export type LoginPayload = {
    email: string;
    password: string;
};

// Information stored inside the authentication token.
export type JwtPayload = {
    userId: string;
};