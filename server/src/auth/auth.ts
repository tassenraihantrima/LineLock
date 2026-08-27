import "dotenv/config";
import jwt from "jsonwebtoken";
import type { Response } from "express";

import type {
    JwtPayload,
    PublicUser,
} from "./authTypes";

// Name of the cookie used to keep the player logged in.
const AUTH_COOKIE_NAME = "linelock_auth";

// A login session lasts for seven days.
const JWT_EXPIRATION = "7d";

// Read the JWT secret from the environment.
// The server should not start authentication without one.
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
            sameSite: "lax",

            // HTTPS-only cookies are required once the app is deployed.
            secure:
                process.env.NODE_ENV === "production",

            // Keep the cookie for seven days.
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
            sameSite: "lax",
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
        createdAt: Date;
    },
): PublicUser {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
    };
}