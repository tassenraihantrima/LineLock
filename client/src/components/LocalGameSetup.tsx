import { useState } from "react";
import "./LocalGameSetup.css";

// Store the configurable options used to create a local match.
export type LocalGameSettings = {
    playerOneName: string;
    playerTwoName: string;
    boardSize: number;
};

type LocalGameSetupProps = {
    initialSettings: LocalGameSettings;
    onStartGame: (settings: LocalGameSettings) => void;
};

// Offer several board sizes without changing the underlying game rules.
const BOARD_SIZE_OPTIONS = [3, 4, 5, 6, 7];

function LocalGameSetup({
    initialSettings,
    onStartGame,
}: LocalGameSetupProps) {
    // Keep form values separate from the active game state.
    const [playerOneName, setPlayerOneName] = useState(
        initialSettings.playerOneName,
    );

    const [playerTwoName, setPlayerTwoName] = useState(
        initialSettings.playerTwoName,
    );

    const [boardSize, setBoardSize] = useState(
        initialSettings.boardSize,
    );

    // Validate and send the selected settings to the main application.
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Use readable defaults when either name contains only spaces.
        const cleanedPlayerOneName =
            playerOneName.trim() || "Player 1";

        const cleanedPlayerTwoName =
            playerTwoName.trim() || "Player 2";

        onStartGame({
            playerOneName: cleanedPlayerOneName,
            playerTwoName: cleanedPlayerTwoName,
            boardSize,
        });
    }

    // Calculate board details so players understand each size option.
    const boxCount = (boardSize - 1) * (boardSize - 1);
    const edgeCount = 2 * boardSize * (boardSize - 1);

    return (
        <section
            className="setup-card"
            aria-labelledby="local-game-setup-heading"
        >
            <div className="setup-heading">
                <p className="setup-label">Local match setup</p>

                <h2 id="local-game-setup-heading">
                    Prepare the board
                </h2>

                <p>
                    Choose both player names and the board size before starting
                    a new local match.
                </p>
            </div>

            <form className="setup-form" onSubmit={handleSubmit}>
                <div className="player-input-grid">
                    <label className="setup-field">
                        <span>Player 1 name</span>

                        <input
                            type="text"
                            value={playerOneName}
                            maxLength={20}
                            autoComplete="off"
                            placeholder="Player 1"
                            onChange={(event) => {
                                setPlayerOneName(event.target.value);
                            }}
                        />
                    </label>

                    <label className="setup-field">
                        <span>Player 2 name</span>

                        <input
                            type="text"
                            value={playerTwoName}
                            maxLength={20}
                            autoComplete="off"
                            placeholder="Player 2"
                            onChange={(event) => {
                                setPlayerTwoName(event.target.value);
                            }}
                        />
                    </label>
                </div>

                <label className="setup-field">
                    <span>Board size</span>

                    <select
                        value={boardSize}
                        onChange={(event) => {
                            setBoardSize(Number(event.target.value));
                        }}
                    >
                        {BOARD_SIZE_OPTIONS.map((size) => {
                            const optionBoxCount = (size - 1) * (size - 1);

                            return (
                                <option key={size} value={size}>
                                    {size} × {size} dots — {optionBoxCount} boxes
                                </option>
                            );
                        })}
                    </select>
                </label>

                <div className="board-preview-summary">
                    <article>
                        <span>Dots</span>
                        <strong>{boardSize * boardSize}</strong>
                    </article>

                    <article>
                        <span>Edges</span>
                        <strong>{edgeCount}</strong>
                    </article>

                    <article>
                        <span>Boxes</span>
                        <strong>{boxCount}</strong>
                    </article>
                </div>

                <button className="start-game-button" type="submit">
                    Start Local Match
                </button>
            </form>
        </section>
    );
}

export default LocalGameSetup;