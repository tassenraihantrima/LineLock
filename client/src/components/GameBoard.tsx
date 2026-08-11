import "./GameBoard.css";
import type {
    Box,
    Edge,
    GameState,
} from "../game/gameModels";

type GameBoardProps = {
    gameState: GameState;
    isGameComplete: boolean;
    isInteractionDisabled?: boolean;
    onEdgeClick: (edgeId: string) => void;
};

// Find one horizontal edge using its board coordinates.
function findHorizontalEdge(
    edges: Edge[],
    row: number,
    column: number,
): Edge | undefined {
    return edges.find(
        (edge) =>
            edge.orientation === "horizontal" &&
            edge.row === row &&
            edge.column === column,
    );
}

// Find one vertical edge using its board coordinates.
function findVerticalEdge(
    edges: Edge[],
    row: number,
    column: number,
): Edge | undefined {
    return edges.find(
        (edge) =>
            edge.orientation === "vertical" &&
            edge.row === row &&
            edge.column === column,
    );
}

// Find one box using its board coordinates.
function findBox(
    boxes: Box[],
    row: number,
    column: number,
): Box | undefined {
    return boxes.find(
        (box) =>
            box.row === row &&
            box.column === column,
    );
}

// Return the visual ownership class for an edge.
function createClaimedEdgeClass(
    edge: Edge | undefined,
): string {
    if (edge?.claimedBy === 1) {
        return "claimed-by-player-one";
    }

    if (edge?.claimedBy === 2) {
        return "claimed-by-player-two";
    }

    return "";
}

// Return the visual ownership class for a completed box.
function createClaimedBoxClass(
    box: Box | undefined,
): string {
    if (box?.claimedBy === 1) {
        return "box-claimed-by-player-one";
    }

    if (box?.claimedBy === 2) {
        return "box-claimed-by-player-two";
    }

    return "";
}

function GameBoard({
    gameState,
    isGameComplete,
    isInteractionDisabled = false,
    onEdgeClick,
}: GameBoardProps) {
    // The rendered grid alternates between dots, edges, and boxes.
    const visualGridSize = gameState.boardSize * 2 - 1;

    // Create one entry for every location in the visual CSS grid.
    const gridPositions = Array.from(
        {
            length: visualGridSize * visualGridSize,
        },
        (_, index) => {
            const row = Math.floor(index / visualGridSize);
            const column = index % visualGridSize;

            return {
                id: `${row}-${column}`,
                row,
                column,
            };
        },
    );

    return (
        <section
            className="board-section"
            aria-labelledby="game-board-heading"
        >
            <div className="board-heading">
                <div>
                    <p className="board-label">
                        {isGameComplete ? "Game complete" : "Local game"}
                    </p>

                    <h2 id="game-board-heading">
                        LineLock Board
                    </h2>
                </div>

                <div className="board-statistics">
                    <p className="board-size">
                        {gameState.boardSize} × {gameState.boardSize} dots
                    </p>

                    <p className="move-count">
                        {gameState.moveCount} of {gameState.edges.length} edges claimed
                    </p>
                </div>
            </div>

            <div className="board-container">
                <div
                    className="game-board"
                    style={{
                        gridTemplateColumns: `repeat(${visualGridSize}, auto)`,
                        gridTemplateRows: `repeat(${visualGridSize}, auto)`,
                    }}
                    role="grid"
                    aria-label={`${gameState.boardSize} by ${gameState.boardSize} LineLock board`}
                >
                    {gridPositions.map((position) => {
                        const rowIsEven = position.row % 2 === 0;
                        const columnIsEven = position.column % 2 === 0;

                        // Even row and column positions contain dots.
                        if (rowIsEven && columnIsEven) {
                            return (
                                <div
                                    key={position.id}
                                    className="board-dot"
                                    role="gridcell"
                                    aria-label={`Dot at row ${position.row / 2 + 1
                                        }, column ${position.column / 2 + 1
                                        }`}
                                />
                            );
                        }

                        // Even rows and odd columns contain horizontal edges.
                        if (rowIsEven && !columnIsEven) {
                            const edge = findHorizontalEdge(
                                gameState.edges,
                                position.row / 2,
                                (position.column - 1) / 2,
                            );

                            const edgeIsClaimed =
                                edge?.claimedBy !== null;

                            const claimedClass =
                                createClaimedEdgeClass(edge);

                            return (
                                <button
                                    key={position.id}
                                    className={`horizontal-edge ${claimedClass}`}
                                    type="button"
                                    role="gridcell"
                                    data-edge-id={edge?.id}
                                    disabled={
                                        !edge ||
                                        edgeIsClaimed ||
                                        isGameComplete ||
                                        isInteractionDisabled
                                    }
                                    aria-pressed={edgeIsClaimed}
                                    aria-label={`Horizontal edge at row ${position.row / 2 + 1
                                        }, column ${(position.column + 1) / 2
                                        }${edgeIsClaimed
                                            ? ", claimed"
                                            : isGameComplete
                                                ? ", unavailable because the game is complete"
                                                : ", available"
                                        }`}
                                    onClick={() => {
                                        if (edge && !isGameComplete && !isInteractionDisabled) {
                                            onEdgeClick(edge.id);
                                        }
                                    }}
                                >
                                    <span className="horizontal-edge-line" />
                                </button>
                            );
                        }

                        // Odd rows and even columns contain vertical edges.
                        if (!rowIsEven && columnIsEven) {
                            const edge = findVerticalEdge(
                                gameState.edges,
                                (position.row - 1) / 2,
                                position.column / 2,
                            );

                            const edgeIsClaimed =
                                edge?.claimedBy !== null;

                            const claimedClass =
                                createClaimedEdgeClass(edge);

                            return (
                                <button
                                    key={position.id}
                                    className={`vertical-edge ${claimedClass}`}
                                    type="button"
                                    role="gridcell"
                                    data-edge-id={edge?.id}
                                    disabled={
                                        !edge ||
                                        edgeIsClaimed ||
                                        isGameComplete
                                    }
                                    aria-pressed={edgeIsClaimed}
                                    aria-label={`Vertical edge at row ${(position.row + 1) / 2
                                        }, column ${position.column / 2 + 1
                                        }${edgeIsClaimed
                                            ? ", claimed"
                                            : isGameComplete
                                                ? ", unavailable because the game is complete"
                                                : ", available"
                                        }`}
                                    onClick={() => {
                                        if (edge && !isGameComplete) {
                                            onEdgeClick(edge.id);
                                        }
                                    }}
                                >
                                    <span className="vertical-edge-line" />
                                </button>
                            );
                        }

                        // Odd row and column positions contain box spaces.
                        const box = findBox(
                            gameState.boxes,
                            (position.row - 1) / 2,
                            (position.column - 1) / 2,
                        );

                        const claimedBoxClass =
                            createClaimedBoxClass(box);

                        // Locate the player who owns this completed box.
                        const boxOwner = gameState.players.find(
                            (player) =>
                                player.number === box?.claimedBy,
                        );

                        return (
                            <div
                                key={position.id}
                                className={`board-box ${claimedBoxClass}`}
                                role="gridcell"
                                data-box-id={box?.id}
                                aria-label={
                                    boxOwner
                                        ? `Box at row ${(position.row + 1) / 2
                                        }, column ${(position.column + 1) / 2
                                        }, claimed by ${boxOwner.name}`
                                        : `Unclaimed box at row ${(position.row + 1) / 2
                                        }, column ${(position.column + 1) / 2
                                        }`
                                }
                            >
                                {boxOwner && (
                                    <span
                                        className="box-owner"
                                        aria-hidden="true"
                                    >
                                        {boxOwner.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default GameBoard;