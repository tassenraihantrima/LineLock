// A player number is limited to the two players supported by the game.
export type PlayerNumber = 1 | 2;

// An edge can run from left to right or from top to bottom.
export type EdgeOrientation = "horizontal" | "vertical";

// The game can be active, completed, or tied.
export type GameStatus = "playing" | "completed" | "tie";

// A player stores the information shown during a match.
export type Player = {
    id: string;
    number: PlayerNumber;
    name: string;
    score: number;
};

// An edge represents one selectable line between two neighboring dots.
export type Edge = {
    id: string;
    orientation: EdgeOrientation;
    row: number;
    column: number;
    claimedBy: PlayerNumber | null;
};

// A box represents one square surrounded by four edges.
export type Box = {
    id: string;
    row: number;
    column: number;
    topEdgeId: string;
    rightEdgeId: string;
    bottomEdgeId: string;
    leftEdgeId: string;
    claimedBy: PlayerNumber | null;
};

// The complete game state contains everything needed to render and play a match.
export type GameState = {
    boardSize: number;
    players: [Player, Player];
    currentPlayer: PlayerNumber;
    edges: Edge[];
    boxes: Box[];
    status: GameStatus;
    winner: PlayerNumber | null;
    moveCount: number;
};

// A move only needs to identify the edge selected by the player.
export type Move = {
    edgeId: string;
    player: PlayerNumber;
};

// The result explains whether a requested move is allowed.
export type MoveValidationResult = {
    isValid: boolean;
    reason?: string;
};