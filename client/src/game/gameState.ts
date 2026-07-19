import {
    DEFAULT_BOARD_SIZE,
    PLAYER_ONE_ID,
    PLAYER_ONE_NUMBER,
    PLAYER_TWO_ID,
    PLAYER_TWO_NUMBER,
} from "./constants";
import type {
    Box,
    Edge,
    GameState,
    Player,
    PlayerNumber,
} from "./gameModels";

// Create a predictable ID for a horizontal edge.
export function createHorizontalEdgeId(row: number, column: number): string {
    return `horizontal-${row}-${column}`;
}

// Create a predictable ID for a vertical edge.
export function createVerticalEdgeId(row: number, column: number): string {
    return `vertical-${row}-${column}`;
}

// Create a predictable ID for a box.
export function createBoxId(row: number, column: number): string {
    return `box-${row}-${column}`;
}

// Create all horizontal and vertical edges for a square dot board.
export function createEdges(boardSize: number): Edge[] {
    const edges: Edge[] = [];

    // A board with N dots has N horizontal rows.
    // Each horizontal row contains N - 1 edges.
    for (let row = 0; row < boardSize; row += 1) {
        for (let column = 0; column < boardSize - 1; column += 1) {
            edges.push({
                id: createHorizontalEdgeId(row, column),
                orientation: "horizontal",
                row,
                column,
                claimedBy: null,
            });
        }
    }

    // A board with N dots has N vertical columns.
    // Each vertical column contains N - 1 edges.
    for (let row = 0; row < boardSize - 1; row += 1) {
        for (let column = 0; column < boardSize; column += 1) {
            edges.push({
                id: createVerticalEdgeId(row, column),
                orientation: "vertical",
                row,
                column,
                claimedBy: null,
            });
        }
    }

    return edges;
}

// Create every box and connect it to the four edges around it.
export function createBoxes(boardSize: number): Box[] {
    const boxes: Box[] = [];

    // A board with N dots has N - 1 boxes across and N - 1 boxes down.
    for (let row = 0; row < boardSize - 1; row += 1) {
        for (let column = 0; column < boardSize - 1; column += 1) {
            boxes.push({
                id: createBoxId(row, column),
                row,
                column,
                topEdgeId: createHorizontalEdgeId(row, column),
                rightEdgeId: createVerticalEdgeId(row, column + 1),
                bottomEdgeId: createHorizontalEdgeId(row + 1, column),
                leftEdgeId: createVerticalEdgeId(row, column),
                claimedBy: null,
            });
        }
    }

    return boxes;
}

// Create the two players used in a local game.
export function createPlayers(
    playerOneName = "Player 1",
    playerTwoName = "Player 2",
): [Player, Player] {
    return [
        {
            id: PLAYER_ONE_ID,
            number: PLAYER_ONE_NUMBER,
            name: playerOneName,
            score: 0,
        },
        {
            id: PLAYER_TWO_ID,
            number: PLAYER_TWO_NUMBER,
            name: playerTwoName,
            score: 0,
        },
    ];
}

// Create a fresh game state that future phases can render and update.
export function createInitialGameState(
    boardSize = DEFAULT_BOARD_SIZE,
    playerOneName = "Player 1",
    playerTwoName = "Player 2",
): GameState {
    if (boardSize < 2) {
        throw new Error("A LineLock board must contain at least two dots per side.");
    }

    return {
        boardSize,
        players: createPlayers(playerOneName, playerTwoName),
        currentPlayer: PLAYER_ONE_NUMBER,
        edges: createEdges(boardSize),
        boxes: createBoxes(boardSize),
        status: "playing",
        winner: null,
        moveCount: 0,
    };
}

// Return one player from the game state by their player number.
export function getPlayerByNumber(
    gameState: GameState,
    playerNumber: PlayerNumber,
): Player {
    const player = gameState.players.find(
        (currentPlayer) => currentPlayer.number === playerNumber,
    );

    if (!player) {
        throw new Error(`Player ${playerNumber} does not exist.`);
    }

    return player;
}