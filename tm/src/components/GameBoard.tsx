// src/components/GameBoard.tsx
import React, { useRef, useEffect, useState } from "react";
import Tile from "./Tile";
import { Tile as TileType } from "../models/Tile";
import "./GameBoard.css";

interface GameBoardProps {
    board: TileType[][];
    selectedTiles: TileType[];
    matchData: { tiles: TileType[]; path: { row: number; col: number }[] } | null;
    handleTileClick: (tile: TileType) => void;
    resetGame: () => void;
    loading: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
    board,
    selectedTiles,
    matchData,
    handleTileClick,
    resetGame,
    loading,
}) => {
    const boardRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState(54);

    useEffect(() => {
        if (boardRef.current) {
            const firstTile = boardRef.current.querySelector(".tile") as HTMLElement;
            if (firstTile) {
                const rect = firstTile.getBoundingClientRect();
                // 这里简单取宽度加上左右 margin（2+2=4）
                setCellSize(rect.width + 4);
            }
        }
    }, [loading]);

    const polylinePoints = matchData
        ? matchData.path
            .map(
                (p) =>
                    `${(p.col - 0.5) * cellSize},${(p.row - 0.5) * cellSize}`
            )
            .join(" ")
        : "";


    return (
        <div className="game-board-wrapper">
            {loading ? (
                <div>加载中...</div>
            ) : (
                <>
                    <div className="game-board" ref={boardRef}>
                        {board.map((row, rowIndex) => (
                            <div key={rowIndex} className="board-row">
                                {row.map(tile => {
                                    const isSelected =
                                        selectedTiles.some(t => t.id === tile.id) ||
                                        (matchData && matchData.tiles.some(t => t.id === tile.id));
                                    return (
                                        <Tile
                                            key={tile.id}
                                            tile={tile}
                                            onClick={() => handleTileClick(tile)}
                                            selected={isSelected === null ? false : isSelected}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                        {matchData && (
                            <svg className="match-line" xmlns="http://www.w3.org/2000/svg">
                                <polyline
                                    points={polylinePoints}
                                    stroke="#fff"            // 外层白色描边
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <polyline
                                    points={polylinePoints}
                                    stroke="#ff0"            // 内层黄色
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                        )}
                    </div>
                    <button className="reset-button" onClick={resetGame}>
                        重置游戏
                    </button>
                </>
            )}
        </div>
    );
};

export default GameBoard;
