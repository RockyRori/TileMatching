// src/utils/gameLogic.ts
import { Tile } from "../models/Tile";

// 生成棋盘：如果行×列为奇数，则减 1 格；总对数为 totalPairs
// 采用自定义逻辑生成 totalPairs 对数字，其中每对数值随机取自 1~D，D 为随机数，范围为 [ceil(totalPairs/2), floor(3*totalPairs/4)+1]
export const generateBoard = (rows: number, cols: number, valuesOverride?: number[]): Tile[][] => {
  let total = rows * cols;
  if (total % 2 !== 0) total = total - 1; // 保证为偶数
  const totalPairs = total / 2; // X 对
  let values: number[] = [];
  if (valuesOverride && valuesOverride.length === total) {
    values = valuesOverride;
  } else {
    // 选取对立数 D
    const minD = Math.ceil(totalPairs / 2);
    const maxD = Math.floor(3 * totalPairs / 4) + 1;
    const D = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
    // 生成 totalPairs 对，每对使用随机数字 [1, D]
    for (let i = 0; i < totalPairs; i++) {
      const num = Math.floor(Math.random() * D) + 1;
      values.push(num, num);
    }
  }
  // 洗牌
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  let board: Tile[][] = [];
  let index = 0;
  for (let r = 0; r < rows; r++) {
    let rowArr: Tile[] = [];
    for (let c = 0; c < cols; c++) {
      if (index < values.length) {
        rowArr.push({
          id: r * cols + c,
          value: values[index],
          isVisible: true,
          row: r,
          col: c,
        });
        index++;
      } else {
        // 对于多余的空格（仅发生于奇数情况），填充不可见
        rowArr.push({
          id: -1,
          value: 0,
          isVisible: false,
          row: r,
          col: c,
        });
      }
    }
    board.push(rowArr);
  }
  return board;
};

// --------------- 路径查找部分 ----------------
// 以下 findPath 保持之前版本的 BFS 实现，允许路径转折不超过 3 次

interface PathPoint {
  row: number;
  col: number;
}

interface BFSState {
  row: number;
  col: number;
  dir: number; // 0:上、1:右、2:下、3:左；-1 表示初始无方向
  turns: number;
  path: PathPoint[];
}

const isCellFree = (
  r: number,
  c: number,
  board: Tile[][],
  start: { row: number; col: number },
  target: { row: number; col: number }
): boolean => {
  const rows = board.length;
  const cols = board[0].length;
  // 边界区域视为空
  if (r === 0 || r === rows + 1 || c === 0 || c === cols + 1) return true;
  // 起点与终点允许通过
  if ((r === start.row && c === start.col) || (r === target.row && c === target.col)) return true;
  return !board[r - 1][c - 1].isVisible;
};

export const findPath = (
  tile1: Tile,
  tile2: Tile,
  board: Tile[][]
): { valid: boolean; path: PathPoint[] } => {
  const rows = board.length;
  const cols = board[0].length;
  const start = { row: tile1.row + 1, col: tile1.col + 1 };
  const target = { row: tile2.row + 1, col: tile2.col + 1 };

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
  ];

  const queue: BFSState[] = [];
  const visited = new Array(rows + 2)
    .fill(0)
    .map(() => new Array(cols + 2).fill(0).map(() => new Array(4).fill(Infinity)));

  queue.push({
    row: start.row,
    col: start.col,
    dir: -1,
    turns: 0,
    path: [start],
  });

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.row === target.row && cur.col === target.col) {
      return { valid: true, path: cur.path };
    }
    for (let d = 0; d < 4; d++) {
      const newRow = cur.row + directions[d].dr;
      const newCol = cur.col + directions[d].dc;
      let newTurns = cur.turns;
      if (cur.dir !== -1 && cur.dir !== d) newTurns++;
      if (newTurns > 2) continue;
      if (newRow < 0 || newRow > rows + 1 || newCol < 0 || newCol > cols + 1) continue;
      if (!isCellFree(newRow, newCol, board, start, target)) continue;
      if (visited[newRow][newCol][d] <= newTurns) continue;
      visited[newRow][newCol][d] = newTurns;
      queue.push({
        row: newRow,
        col: newCol,
        dir: d,
        turns: newTurns,
        path: [...cur.path, { row: newRow, col: newCol }],
      });
    }
  }
  return { valid: false, path: [] };
};

// ----------------- 棋盘重排 -----------------
// 根据 mode（"normal", "left", "right", "up", "down", "inside", "outside"）对 board 进行重排，
// 注意重排后需要更新每个 tile 的 row 与 col 值。
// 对于空位，我们生成 id 为 -1 的空对象。

export const rearrangeBoard = (mode: string, board: Tile[][]): Tile[][] => {
  const rows = board.length;
  const cols = board[0].length;
  let newBoard: Tile[][] = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => ({
      id: -1,
      value: 0,
      isVisible: false,
      row: i,
      col: j,
    }))
  );

  switch (mode) {
    case "normal":
      return board;
    case "left":
      for (let i = 0; i < rows; i++) {
        const visible = board[i].filter((t) => t.isVisible);
        for (let j = 0; j < cols; j++) {
          if (j < visible.length) {
            newBoard[i][j] = { ...visible[j], row: i, col: j };
          } else {
            newBoard[i][j] = { id: -1, value: 0, isVisible: false, row: i, col: j };
          }
        }
      }
      break;
    case "right":
      for (let i = 0; i < rows; i++) {
        const visible = board[i].filter((t) => t.isVisible);
        const emptyCount = cols - visible.length;
        for (let j = 0; j < cols; j++) {
          if (j < emptyCount) {
            newBoard[i][j] = { id: -1, value: 0, isVisible: false, row: i, col: j };
          } else {
            newBoard[i][j] = { ...visible[j - emptyCount], row: i, col: j };
          }
        }
      }
      break;
    case "up":
      for (let j = 0; j < cols; j++) {
        let visible: Tile[] = [];
        for (let i = 0; i < rows; i++) {
          if (board[i][j].isVisible) visible.push(board[i][j]);
        }
        for (let i = 0; i < rows; i++) {
          if (i < visible.length) {
            newBoard[i][j] = { ...visible[i], row: i, col: j };
          } else {
            newBoard[i][j] = { id: -1, value: 0, isVisible: false, row: i, col: j };
          }
        }
      }
      break;
    case "down":
      for (let j = 0; j < cols; j++) {
        let visible: Tile[] = [];
        for (let i = 0; i < rows; i++) {
          if (board[i][j].isVisible) visible.push(board[i][j]);
        }
        const emptyCount = rows - visible.length;
        for (let i = 0; i < rows; i++) {
          if (i < emptyCount) {
            newBoard[i][j] = { id: -1, value: 0, isVisible: false, row: i, col: j };
          } else {
            newBoard[i][j] = { ...visible[i - emptyCount], row: i, col: j };
          }
        }
      }
      break;
    case "inside": {
      let visible: Tile[] = [];
      board.forEach((row) => {
        row.forEach((tile) => {
          if (tile.isVisible) visible.push(tile);
        });
      });
      const spiral = generateSpiralFromCenter(rows, cols);
      for (let index = 0; index < spiral.length; index++) {
        const { row, col } = spiral[index];
        if (index < visible.length) {
          newBoard[row][col] = { ...visible[index], row, col };
        } else {
          newBoard[row][col] = { id: -1, value: 0, isVisible: false, row, col };
        }
      }
      break;
    }
    case "outside": {
      let visible: Tile[] = [];
      board.forEach((row) => {
        row.forEach((tile) => {
          if (tile.isVisible) visible.push(tile);
        });
      });
      const spiral = generateSpiralFromOutside(rows, cols);
      for (let index = 0; index < spiral.length; index++) {
        const { row, col } = spiral[index];
        if (index < visible.length) {
          newBoard[row][col] = { ...visible[index], row, col };
        } else {
          newBoard[row][col] = { id: -1, value: 0, isVisible: false, row, col };
        }
      }
      break;
    }
    default:
      return board;
  }
  return newBoard;
};

// ---------- 辅助：生成螺旋坐标 ----------

// 生成“inside”模式所用的坐标：按照距离中心由近到远排序
export const generateSpiralFromCenter = (rows: number, cols: number): { row: number; col: number }[] => {
  let coords: { row: number; col: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      coords.push({ row: r, col: c });
    }
  }
  const centerRow = (rows - 1) / 2;
  const centerCol = (cols - 1) / 2;
  coords.sort((a, b) => {
    const da = Math.sqrt((a.row - centerRow) ** 2 + (a.col - centerCol) ** 2);
    const db = Math.sqrt((b.row - centerRow) ** 2 + (b.col - centerCol) ** 2);
    if (da === db) return a.row === b.row ? a.col - b.col : a.row - b.row;
    return da - db;
  });
  return coords;
};

// 生成“outside”模式所用的坐标：采用常规螺旋顺序（从外层向内收敛）
export const generateSpiralFromOutside = (rows: number, cols: number): { row: number; col: number }[] => {
  let coords: { row: number; col: number }[] = [];
  let top = 0,
    left = 0,
    bottom = rows - 1,
    right = cols - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) {
      coords.push({ row: top, col: j });
    }
    top++;
    for (let i = top; i <= bottom; i++) {
      coords.push({ row: i, col: right });
    }
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) {
        coords.push({ row: bottom, col: j });
      }
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) {
        coords.push({ row: i, col: left });
      }
      left++;
    }
  }
  return coords;
};
