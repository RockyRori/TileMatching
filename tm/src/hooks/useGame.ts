// src/hooks/useGame.ts
import { useState } from "react";
import { generateBoard, canConnect } from "../utils/gameLogic";
import { Tile } from "../models/Tile";

const ROWS = 6;
const COLS = 6;

export const useGame = () => {
    // 初始化棋盘
    const [board, setBoard] = useState<Tile[][]>(() => generateBoard(ROWS, COLS));
    // 保存当前选中的图块（最多两个）
    const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);

    const handleTileClick = (tile: Tile) => {
        // 如果图块已经消除，则不处理
        if (!tile.isVisible) {
            return;
        }
        // 没有选中时，选中第一个图块
        if (selectedTiles.length === 0) {
            setSelectedTiles([tile]);
        } else if (selectedTiles.length === 1) {
            // 如果点击同一图块，则取消选中
            if (selectedTiles[0].id === tile.id) {
                setSelectedTiles([]);
                return;
            }
            const firstTile = selectedTiles[0];
            // 判断两者是否同值且可以连接
            if (firstTile.value === tile.value && canConnect(firstTile, tile, board)) {
                // 更新棋盘状态，将匹配的两个图块设为不可见
                setBoard((prevBoard) =>
                    prevBoard.map((row) =>
                        row.map((t) => {
                            if (t.id === firstTile.id || t.id === tile.id) {
                                return { ...t, isVisible: false };
                            }
                            return t;
                        })
                    )
                );
            }
            // 无论是否匹配，清除选中状态
            setSelectedTiles([]);
        }
    };

    // 重置游戏：重新生成棋盘并清空选中状态
    const resetGame = () => {
        setBoard(generateBoard(ROWS, COLS));
        setSelectedTiles([]);
    };

    return {
        board,
        selectedTiles,
        handleTileClick,
        resetGame,
    };
};
