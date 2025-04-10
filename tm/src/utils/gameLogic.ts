// src/utils/gameLogic.ts
import { Tile } from "../models/Tile";

/**
 * 生成棋盘：
 * 如果行×列为奇数，则减 1 格，确保总格数为偶数；
 * 根据总对数 totalPairs，采用自定义逻辑生成 totalPairs 对数字，
 * 每对数值随机取自 1~D，其中 D 的取值范围为 [ceil(totalPairs/2), floor(3*totalPairs/4)+1]。
 * 如果提供 valuesOverride 且长度合适，则直接使用该数组。
 */
export const generateBoard = (rows: number, cols: number, valuesOverride?: number[]): Tile[][] => {
  let total = rows * cols;
  if (total % 2 !== 0) total = total - 1; // 保证为偶数格数
  const totalPairs = total / 2;
  let values: number[] = [];
  if (valuesOverride && valuesOverride.length === total) {
    values = valuesOverride;
  } else {
    const minD = Math.ceil(totalPairs / 2);
    const maxD = Math.floor((3 * totalPairs) / 4) + 1;
    const D = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
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
        // 对于余下（仅出现在奇数格数时）的空格填充占位对象
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

/* ---------------- 路径查找部分 ----------------
   findPath 使用 BFS 寻找两块之间的连线路径，允许转弯数不超过 3 次。
   注意：内部采用扩展棋盘坐标（即每个 tile 坐标 +1），以便处理边界空区。
*/
interface PathPoint {
  row: number;
  col: number;
}

interface BFSState {
  row: number;
  col: number;
  dir: number; // 0:上、1:右、2:下、3:左；-1 表示初始没有方向
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
): { valid: boolean; path: PathPoint[]; turns: number } => {
  const rows = board.length;
  const cols = board[0].length;
  // 使用扩展棋盘坐标，便于处理外部边界
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
      return { valid: true, path: cur.path, turns: cur.turns };
    }
    for (let d = 0; d < 4; d++) {
      const newRow = cur.row + directions[d].dr;
      const newCol = cur.col + directions[d].dc;
      let newTurns = cur.turns;
      if (cur.dir !== -1 && cur.dir !== d) newTurns++;
      // 允许转弯数最多为 2
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
  return { valid: false, path: [], turns: -1 };
};

/* ---------------- 棋盘重排 ----------------
   根据 mode（"normal", "left", "right", "up", "down", "inside", "outside"）对 board 进行重排，
   并确保返回的二维数组的尺寸始终为原有 rows x cols，每个位置都有占位对象（id 为 -1）作为填充。
*/
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
      // 正常模式下，直接返回原棋盘
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

/* ---------- 辅助函数：生成螺旋坐标 ---------- */

/**
 * generateSpiralFromCenter：用于 "inside" 模式
 * 返回的坐标按与中心距离由近到远排序
 */
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

/**
 * generateSpiralFromOutside：用于 "outside" 模式
 * 返回的坐标按照从外层向内收敛的螺旋顺序排列
 */
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
