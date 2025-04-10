// src/components/GameBoard.tsx
import React from "react";
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
    // 使用固定的单元格尺寸，确保与 CSS 中 .tile 一致（例如宽50 + margin 2px×2 = 54px）
    const cellSize = 54;

    // 计算 polyline 的坐标
    // 注意：findPath 返回的坐标基于扩展棋盘坐标（即每个 tile 坐标 + 1）
    // 因此，需要用 (p.col - 0.5) 与 (p.row - 0.5) 还原到实际棋盘，然后乘以 cellSize 得到像素位置
    const polylinePoints = matchData
        ? matchData.path
            .map((p) => `${(p.col - 0.5) * cellSize},${(p.row - 0.5) * cellSize}`)
            .join(" ")
        : "";

    return (
        <div className="game-board-wrapper">
            {loading ? (
                <div>加载中...</div>
            ) : (
                <>
                    <div className="game-board">
                        {board.map((row, rowIndex) => (
                            <div key={rowIndex} className="board-row">
                                {row.map((tile) => {
                                    const isSelected =
                                        selectedTiles.some((t) => t.id === tile.id) ||
                                        (matchData && matchData.tiles.some((t) => t.id === tile.id));
                                    return (
                                        <Tile
                                            key={tile.id}
                                            tile={tile}
                                            onClick={() => handleTileClick(tile)}
                                            selected={!!isSelected}
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
