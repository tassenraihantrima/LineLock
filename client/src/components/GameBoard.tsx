import "./GameBoard.css";
import type { Box, Edge, GameState } from "../game/gameModels";

type GameBoardProps = {
    gameState: GameState;
};

// Find one horizontal edge using its board position.
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

// Find one vertical edge using its board position.
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

// Find one box using its board position.
function findBox(
    boxes: Box[],
    row: number,
    column: number,
): Box | undefined {
    return boxes.find(
        (box) => box.row === row && box.column === column,
    );
}

function GameBoard({ gameState }: GameBoardProps) {
    // The visual grid includes dots, edges, and boxes.
    // A five-dot board becomes a nine-by-nine CSS grid.
    const visualGridSize = gameState.boardSize * 2 - 1;

    // Create one entry for every visual row and column position.
    const gridPositions = Array.from(
        { length: visualGridSize * visualGridSize },
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
        <section className="board-section" aria-labelledby="game-board-heading">
            <div className="board-heading">
                <div>
                    <p className="board-label">Local game</p>
                    <h2 id="game-board-heading">LineLock Board</h2>
                </div>

                <p className="board-size">
                    {gameState.boardSize} × {gameState.boardSize} dots
                </p>
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

                        // Even rows and columns represent dot positions.
                        if (rowIsEven && columnIsEven) {
                            return (
                                <div
                                    key={position.id}
                                    className="board-dot"
                                    role="gridcell"
                                    aria-label={`Dot at row ${position.row / 2 + 1}, column ${position.column / 2 + 1
                                        }`}
                                />
                            );
                        }

                        // Even rows and odd columns represent horizontal edges.
                        if (rowIsEven && !columnIsEven) {
                            const edge = findHorizontalEdge(
                                gameState.edges,
                                position.row / 2,
                                (position.column - 1) / 2,
                            );

                            return (
                                <div
                                    key={position.id}
                                    className="horizontal-edge"
                                    role="gridcell"
                                    data-edge-id={edge?.id}
                                    aria-label={`Horizontal edge at row ${position.row / 2 + 1
                                        }, column ${(position.column + 1) / 2}`}
                                >
                                    <span className="horizontal-edge-line" />
                                </div>
                            );
                        }

                        // Odd rows and even columns represent vertical edges.
                        if (!rowIsEven && columnIsEven) {
                            const edge = findVerticalEdge(
                                gameState.edges,
                                (position.row - 1) / 2,
                                position.column / 2,
                            );

                            return (
                                <div
                                    key={position.id}
                                    className="vertical-edge"
                                    role="gridcell"
                                    data-edge-id={edge?.id}
                                    aria-label={`Vertical edge at row ${(position.row + 1) / 2
                                        }, column ${position.column / 2 + 1}`}
                                >
                                    <span className="vertical-edge-line" />
                                </div>
                            );
                        }

                        // Odd rows and columns represent the box spaces.
                        const box = findBox(
                            gameState.boxes,
                            (position.row - 1) / 2,
                            (position.column - 1) / 2,
                        );

                        return (
                            <div
                                key={position.id}
                                className="board-box"
                                role="gridcell"
                                data-box-id={box?.id}
                                aria-label={`Box at row ${(position.row + 1) / 2
                                    }, column ${(position.column + 1) / 2}`}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default GameBoard;