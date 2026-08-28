import type {
    NextFunction,
    Request,
    Response,
} from "express";

import {
    getAuthCookieName,
    verifyAuthToken,
} from "./auth";

// Extend the normal Express request so authenticated
// routes can access the ID of the logged-in user.
export type AuthenticatedRequest =
    Request & {
        userId?: string;
    };

// Protect routes that should only be available
// to users who are currently logged in.
export function authenticateRequest(
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
): void {
    // Read LineLock's authentication cookie.
    const token =
        request.cookies?.[
        getAuthCookieName()
        ];

    if (!token) {
        response.status(401).json({
            success: false,
            message: "Authentication is required.",
        });

        return;
    }

    // Verify the token before trusting the user ID inside it.
    const payload = verifyAuthToken(token);

    if (!payload) {
        response.status(401).json({
            success: false,
            message:
                "Your session is invalid or expired.",
        });

        return;
    }

    // Make the authenticated user's ID available
    // to the route that runs after this middleware.
    request.userId = payload.userId;

    next();
}