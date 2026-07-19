import type {
    Box,
    Edge,
    GameState,
    Move,
    MoveValidationResult,
    PlayerNumber,
} from "./gameModels";

// Find an edge using its unique ID.
export function getEdgeById(
    edges: Edge[],
    edgeId: string,
): Edge | undefined {
    return edges.find((edge) => edge.id === edgeId);
}

// Check whether an edge is still available.
export function isEdgeAvailable(edge: Edge): boolean {
    return edge.claimedBy === null;
}

// Check whether a move follows the current game rules.
export function validateMove(
    gameState: GameState,
    move: Move,
): MoveValidationResult {
    if (gameState.status !== "playing") {
        return {
            isValid: false,
            reason: "The game is no longer active.",
        };
    }

    if (move.player !== gameState.currentPlayer) {
        return {
            isValid: false,
            reason: "It is not this player's turn.",
        };
    }

    const selectedEdge = getEdgeById(gameState.edges, move.edgeId);

    if (!selectedEdge) {
        return {
            isValid: false,
            reason: "The selected edge does not exist.",
        };
    }

    if (!isEdgeAvailable(selectedEdge)) {
        return {
            isValid: false,
            reason: "The selected edge has already been claimed.",
        };
    }

    return {
        isValid: true,
    };
}

// Return the two boxes that may touch an edge.
// Border edges will only belong to one box.
export function getBoxesForEdge(boxes: Box[], edgeId: string): Box[] {
    return boxes.filter(
        (box) =>
            box.topEdgeId === edgeId ||
            box.rightEdgeId === edgeId ||
            box.bottomEdgeId === edgeId ||
            box.leftEdgeId === edgeId,
    );
}

// Check whether all four edges surrounding a box have been claimed.
export function isBoxComplete(box: Box, edges: Edge[]): boolean {
    const surroundingEdgeIds = [
        box.topEdgeId,
        box.rightEdgeId,
        box.bottomEdgeId,
        box.leftEdgeId,
    ];

    return surroundingEdgeIds.every((edgeId) => {
        const edge = getEdgeById(edges, edgeId);
        return edge?.claimedBy !== null && edge?.claimedBy !== undefined;
    });
}

// Return the other player's number.
export function getNextPlayer(
    currentPlayer: PlayerNumber,
): PlayerNumber {
    return currentPlayer === 1 ? 2 : 1;
}

// A game is complete after every box belongs to a player.
export function isGameComplete(boxes: Box[]): boolean {
    return boxes.every((box) => box.claimedBy !== null);
}

// Compare scores and return the winner.
// A null result means the scores are tied.
export function determineWinner(
    gameState: GameState,
): PlayerNumber | null {
    const [playerOne, playerTwo] = gameState.players;

    if (playerOne.score > playerTwo.score) {
        return playerOne.number;
    }

    if (playerTwo.score > playerOne.score) {
        return playerTwo.number;
    }

    return null;
}