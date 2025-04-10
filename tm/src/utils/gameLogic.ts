// src/utils/gameLogic.ts
import { Tile } from "../models/Tile";

// 生成一个 rows x cols 的随机棋盘，要求格数为偶数（每个值出现两次）
export const generateBoard = (rows: number, cols: number): Tile[][] => {
    const total = rows * cols;
    if (total % 2 !== 0) {
        throw new Error("棋盘的格数必须为偶数。");
    }
    const numPairs = total / 2;
    const values: number[] = [];
    for (let i = 1; i <= numPairs; i++) {
        values.push(i, i);
    }
    // 洗牌算法
    for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }

    const board: Tile[][] = [];
    let index = 0;
    for (let r = 0; r < rows; r++) {
        const row: Tile[] = [];
        for (let c = 0; c < cols; c++) {
            row.push({
                id: index,
                value: values[index],
                isVisible: true,
                row: r,
                col: c,
            });
            index++;
        }
        board.push(row);
    }
    return board;
};

// 简化判断：若两个图块在同一行或同一列，且中间没有其他未消除的图块，则可连接
export const canConnect = (tile1: Tile, tile2: Tile, board: Tile[][]): boolean => {
    if (tile1.row === tile2.row) {
        const start = Math.min(tile1.col, tile2.col) + 1;
        const end = Math.max(tile1.col, tile2.col);
        for (let c = start; c < end; c++) {
            if (board[tile1.row][c].isVisible) return false;
        }
        return true;
    }
    if (tile1.col === tile2.col) {
        const start = Math.min(tile1.row, tile2.row) + 1;
        const end = Math.max(tile1.row, tile2.row);
        for (let r = start; r < end; r++) {
            if (board[r][tile1.col].isVisible) return false;
        }
        return true;
    }
    return false;
};
