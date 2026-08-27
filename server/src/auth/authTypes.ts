// The user information that is safe to send back to the client.
// Never include passwordHash in this type.
export type PublicUser = {
    id: string;
    email: string;
    username: string;
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

// Information stored inside our authentication token.
export type JwtPayload = {
    userId: string;
};