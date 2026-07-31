import type {
    Box,
    Edge,
    GameState,
    Move,
    PlayerNumber,
} from "./gameModels";

// Describe the result returned after validating an attempted move.
export type MoveValidationResult = {
    isValid: boolean;
    message: string;
};

// Find one edge using its orientation and board coordinates.
function findEdge(
    edges: Edge[],
    orientation: Edge["orientation"],
    row: number,
    column: number,
): Edge | undefined {
    return edges.find(
        (edge) =>
            edge.orientation === orientation &&
            edge.row === row &&
            edge.column === column,
    );
}

// Check whether all four edges surrounding a box have been claimed.
function isBoxComplete(
    box: Box,
    edges: Edge[],
): boolean {
    // The top edge shares the same row and column as the box.
    const topEdge = findEdge(
        edges,
        "horizontal",
        box.row,
        box.column,
    );

    // The bottom edge is one horizontal row below the box.
    const bottomEdge = findEdge(
        edges,
        "horizontal",
        box.row + 1,
        box.column,
    );

    // The left edge shares the same row and column as the box.
    const leftEdge = findEdge(
        edges,
        "vertical",
        box.row,
        box.column,
    );

    // The right edge is one vertical column to the right of the box.
    const rightEdge = findEdge(
        edges,
        "vertical",
        box.row,
        box.column + 1,
    );

    // A box is complete only when all four surrounding edges are owned.
    return (
        topEdge?.claimedBy !== null &&
        bottomEdge?.claimedBy !== null &&
        leftEdge?.claimedBy !== null &&
        rightEdge?.claimedBy !== null
    );
}

// Return the player who should act after a normal move.
function getOtherPlayer(
    currentPlayer: PlayerNumber,
): PlayerNumber {
    return currentPlayer === 1 ? 2 : 1;
}

// Validate an attempted move before changing the game state.
export function validateMove(
    gameState: GameState,
    move: Move,
): MoveValidationResult {
    // Reject moves submitted for someone other than the active player.
    if (move.player !== gameState.currentPlayer) {
        return {
            isValid: false,
            message: "The move does not belong to the current player.",
        };
    }

    // Find the requested edge in the current board state.
    const selectedEdge = gameState.edges.find(
        (edge) => edge.id === move.edgeId,
    );

    // Reject edge IDs that do not exist.
    if (!selectedEdge) {
        return {
            isValid: false,
            message: "The selected edge does not exist.",
        };
    }

    // Prevent an already claimed edge from being selected again.
    if (selectedEdge.claimedBy !== null) {
        return {
            isValid: false,
            message: "The selected edge has already been claimed.",
        };
    }

    return {
        isValid: true,
        message: "The move is valid.",
    };
}

// Claim an edge, detect completed boxes, update scores, and manage turns.
export function claimEdge(
    gameState: GameState,
    move: Move,
): GameState {
    // Validate the move before creating any updated game data.
    const validationResult = validateMove(gameState, move);

    // Invalid moves leave the complete state unchanged.
    if (!validationResult.isValid) {
        return gameState;
    }

    // Create a new edge array containing the newly claimed edge.
    const updatedEdges = gameState.edges.map((edge) => {
        if (edge.id !== move.edgeId) {
            return edge;
        }

        return {
            ...edge,
            claimedBy: move.player,
        };
    });

    // Find every previously unclaimed box completed by this move.
    const newlyCompletedBoxIds = gameState.boxes
        .filter(
            (box) =>
                box.claimedBy === null &&
                isBoxComplete(box, updatedEdges),
        )
        .map((box) => box.id);

    // Assign each newly completed box to the player who made the move.
    const updatedBoxes = gameState.boxes.map((box) => {
        if (!newlyCompletedBoxIds.includes(box.id)) {
            return box;
        }

        return {
            ...box,
            claimedBy: move.player,
        };
    });

    // One edge may complete zero, one, or two boxes.
    const completedBoxCount = newlyCompletedBoxIds.length;

    // Update both players while preserving the fixed two-player tuple type.
    const updatedPlayers: GameState["players"] = [
        gameState.players[0].number === move.player
            ? {
                ...gameState.players[0],
                score:
                    gameState.players[0].score +
                    completedBoxCount,
            }
            : gameState.players[0],

        gameState.players[1].number === move.player
            ? {
                ...gameState.players[1],
                score:
                    gameState.players[1].score +
                    completedBoxCount,
            }
            : gameState.players[1],
    ];

    // Completing a box gives the current player another turn.
    // Otherwise, control passes to the other player.
    const nextPlayer =
        completedBoxCount > 0
            ? gameState.currentPlayer
            : getOtherPlayer(gameState.currentPlayer);

    // Return a completely new game-state object.
    return {
        ...gameState,
        edges: updatedEdges,
        boxes: updatedBoxes,
        players: updatedPlayers,
        currentPlayer: nextPlayer,
        moveCount: gameState.moveCount + 1,
    };
}