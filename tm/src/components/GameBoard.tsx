// src/components/GameBoard.tsx
import React from "react";
import Tile from "./Tile";
import { useGame } from "../hooks/useGame";
import "./GameBoard.css";

const GameBoard: React.FC = () => {
    const { board, handleTileClick, resetGame } = useGame();

    return (
        <div className="game-board-container">
            <div className="game-board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {row.map((tile) => (
                            <Tile key={tile.id} tile={tile} onClick={() => handleTileClick(tile)} />
                        ))}
                    </div>
                ))}
            </div>
            <button className="reset-button" onClick={resetGame}>
                重置游戏
            </button>
        </div>
    );
};

export default GameBoard;
