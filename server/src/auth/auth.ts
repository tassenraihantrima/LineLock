import "dotenv/config";
import jwt from "jsonwebtoken";
import type { Response } from "express";

import type {
    JwtPayload,
    PublicUser,
} from "./authTypes.js";

// Name of the cookie used to keep the player logged in.
const AUTH_COOKIE_NAME = "linelock_auth";

// A login session lasts for seven days.
const JWT_EXPIRATION = "7d";

// Read the JWT secret from the environment.
// Authentication cannot operate without this value.
function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is required.");
    }

    return secret;
}

// Create a signed token for a logged-in user.
export function createAuthToken(
    userId: string,
): string {
    return jwt.sign(
        { userId },
        getJwtSecret(),
        {
            expiresIn: JWT_EXPIRATION,
        },
    );
}

// Check whether a token is valid and return its user ID.
export function verifyAuthToken(
    token: string,
): JwtPayload | null {
    try {
        const payload = jwt.verify(
            token,
            getJwtSecret(),
        );

        if (
            typeof payload === "string" ||
            typeof payload.userId !== "string"
        ) {
            return null;
        }

        return {
            userId: payload.userId,
        };
    } catch {
        // Invalid and expired tokens are treated as logged out.
        return null;
    }
}

// Store the authentication token in an HTTP-only cookie.
// JavaScript in the browser cannot directly read this cookie.
export function setAuthCookie(
    response: Response,
    token: string,
): void {
    response.cookie(
        AUTH_COOKIE_NAME,
        token,
        {
            httpOnly: true,
            // Local development can use a same-site cookie.
            // Production uses a secure cross-site cookie because
            // the frontend and backend are deployed separately.
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            secure:
                process.env.NODE_ENV === "production",

            // Keep the session available for seven days.
            maxAge:
                7 *
                24 *
                60 *
                60 *
                1000,
        },
    );
}

// Remove the authentication cookie when the user logs out.
export function clearAuthCookie(
    response: Response,
): void {
    response.clearCookie(
        AUTH_COOKIE_NAME,
        {
            httpOnly: true,
            // Local development can use a same-site cookie.
            // Production uses a secure cross-site cookie because
            // the frontend and backend are deployed separately.
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            secure:
                process.env.NODE_ENV === "production",
        },
    );
}

// Keep the cookie name in one place so middleware
// does not need to duplicate it.
export function getAuthCookieName(): string {
    return AUTH_COOKIE_NAME;
}

// Convert a database user into the safe version
// that can be returned to the frontend.
export function createPublicUser(
    user: {
        id: string;
        email: string;
        username: string;

        gamesPlayed: number;
        wins: number;
        losses: number;
        ties: number;

        createdAt: Date;
    },
): PublicUser {
    return {
        id: user.id,
        email: user.email,
        username: user.username,

        gamesPlayed:
            user.gamesPlayed,

        wins:
            user.wins,

        losses:
            user.losses,

        ties:
            user.ties,

        createdAt:
            user.createdAt.toISOString(),
    };
}