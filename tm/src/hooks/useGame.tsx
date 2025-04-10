// src/hooks/useGame.ts
import { useState, useEffect } from "react";
import { findPath, generateBoard, rearrangeBoard } from "../utils/gameLogic";
import { Tile } from "../models/Tile";

interface MatchData {
    tiles: Tile[];
    path: { row: number; col: number }[];
}

export const useGame = () => {
    const [board, setBoard] = useState<Tile[][]>([]);
    const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [animating, setAnimating] = useState(false);
    const [level, setLevel] = useState(1);
    const [loading, setLoading] = useState(true);
    const [levelMode, setLevelMode] = useState("normal");

    // 加载关卡配置文件（放在 src/data 文件夹内），格式示例：
    // {
    //   "rows": 3,
    //   "cols": 4,
    //   "mode": "normal"
    // }
    const loadLevel = async (lvl: number) => {
        setLoading(true);
        try {
            // 使用动态导入加载 src/data/level{lvl}.json
            const module = await import(`../data/level${lvl}.json`);
            const data = module.default;
            const rows = data.rows;
            const cols = data.cols;
            const mode = data.mode; // "normal", "left", "right", "up", "down", "inside", "outside"
            setLevelMode(mode);
            const newBoard = generateBoard(rows, cols);
            setBoard(newBoard);
        } catch (error) {
            console.error("加载关卡失败", error);
        }
        setSelectedTiles([]);
        setMatchData(null);
        setAnimating(false);
        setLoading(false);
    };

    useEffect(() => {
        loadLevel(level);
    }, [level]);

    const handleTileClick = (tile: Tile) => {
        if (animating || !tile.isVisible) return;
        if (selectedTiles.find((t) => t.id === tile.id)) {
            setSelectedTiles(selectedTiles.filter((t) => t.id !== tile.id));
            return;
        }
        if (selectedTiles.length === 0) {
            setSelectedTiles([tile]);
        } else if (selectedTiles.length === 1) {
            const firstTile = selectedTiles[0];
            if (firstTile.id === tile.id) {
                setSelectedTiles([]);
                return;
            }
            if (firstTile.value === tile.value) {
                const result = findPath(firstTile, tile, board);
                if (result.valid) {
                    setMatchData({ tiles: [firstTile, tile], path: result.path });
                    setAnimating(true);
                    setTimeout(() => {
                        setBoard((prevBoard) => {
                            const updated = prevBoard.map((row) =>
                                row.map((t) => {
                                    if (t.id === firstTile.id || t.id === tile.id) {
                                        return { ...t, isVisible: false };
                                    }
                                    return t;
                                })
                            );
                            if (levelMode !== "normal") {
                                return rearrangeBoard(levelMode, updated);
                            }
                            return updated;
                        });
                        setMatchData(null);
                        setSelectedTiles([]);
                        setAnimating(false);
                    }, 1500);
                    return;
                }
            }
            setSelectedTiles([]);
        }
    };

    const resetGame = () => {
        loadLevel(level);
    };

    const changeLevel = (newLevel: number) => {
        setLevel(newLevel);
    };

    return {
        board,
        selectedTiles,
        matchData,
        handleTileClick,
        resetGame,
        changeLevel,
        level,
        loading,
    };
};
