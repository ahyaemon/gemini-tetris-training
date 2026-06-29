import type { Board, MinoType, Point, MinoState, GameState } from './types';
import { pullNextMino, getInitialBagState } from './bag';
import type { BagState } from './bag';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const MINO_LAYOUTS: Record<MinoType, Point[][]> = {
  I: [
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
    [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  ],
  O: [
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
  ],
  T: [
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 0 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 1 }],
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 0, y: 1 }],
  ],
  L: [
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 0, y: 0 }],
  ],
  J: [
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 0 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 0 }],
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
  ],
  S: [
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 1 }],
    [{ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 2 }],
  ],
  Z: [
    [{ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }],
    [{ x: 1, y: 1 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
  ],
};

export const INITIAL_POSITIONS: Record<MinoType, Point> = {
  I: { x: 3, y: -1 },
  O: { x: 3, y: 0 },
  T: { x: 3, y: 0 },
  L: { x: 3, y: 0 },
  J: { x: 3, y: 0 },
  S: { x: 3, y: 0 },
  Z: { x: 3, y: 0 },
};

// SRS Kick data (X right, Y down)
// Wall kick test offsets for standard pieces
const SRS_KICK_DATA: Record<string, Point[]> = {
  '0->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '1->2': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '2->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '2->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '3->0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '0->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
};

// Wall kick test offsets for 'I' piece
const SRS_KICK_DATA_I: Record<string, Point[]> = {
  '0->1': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  '1->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
  '2->1': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  '2->3': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  '3->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  '0->3': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
};

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

export function isValidPosition(
  board: Board,
  type: MinoType,
  rotation: number,
  position: Point
): boolean {
  if (!type || !MINO_LAYOUTS[type]) return false;
  const layout = MINO_LAYOUTS[type][rotation];
  for (const block of layout) {
    const x = position.x + block.x;
    const y = position.y + block.y;

    if (x < 0 || x >= BOARD_WIDTH) return false;
    if (y >= BOARD_HEIGHT) return false;
    // Allow spawning above the board (y < 0), but if inside the board, must not overlap with blocks
    if (y >= 0) {
      if (board[y][x] !== null) return false;
    }
  }
  return true;
}

export function getGhostPosition(board: Board, mino: MinoState | null): Point {
  if (!mino) return { x: 0, y: 0 };
  let y = mino.position.y;
  while (isValidPosition(board, mino.type, mino.rotation, { x: mino.position.x, y: y + 1 })) {
    y++;
  }
  return { x: mino.position.x, y };
}

export function moveMino(board: Board, mino: MinoState | null, dir: Point): MinoState | null {
  if (!mino) return null;
  const nextPos = { x: mino.position.x + dir.x, y: mino.position.y + dir.y };
  if (isValidPosition(board, mino.type, mino.rotation, nextPos)) {
    return { ...mino, position: nextPos };
  }
  return null;
}

export function rotateMino(board: Board, mino: MinoState | null, rotationDir: 'clockwise' | 'counter-clockwise'): { mino: MinoState; kicked: boolean } | null {
  if (!mino) return null;
  if (mino.type === 'O') {
    return { mino, kicked: false };
  }

  const fromRot = mino.rotation;
  let toRot = mino.rotation;
  if (rotationDir === 'clockwise') {
    toRot = (mino.rotation + 1) % 4;
  } else {
    toRot = (mino.rotation + 3) % 4;
  }

  const transitionKey = `${fromRot}->${toRot}`;
  const kickOffsets = mino.type === 'I' ? SRS_KICK_DATA_I[transitionKey] : SRS_KICK_DATA[transitionKey];

  if (!kickOffsets) return null;

  for (let i = 0; i < kickOffsets.length; i++) {
    const offset = kickOffsets[i];
    const nextPos = {
      x: mino.position.x + offset.x,
      y: mino.position.y + offset.y,
    };
    if (isValidPosition(board, mino.type, toRot, nextPos)) {
      return {
        mino: { ...mino, rotation: toRot, position: nextPos },
        kicked: i > 0, // Kicked if we didn't use the first test (0,0)
      };
    }
  }

  return null;
}

export function checkTSpin(
  board: Board,
  mino: MinoState,
  isLastMoveRotation: boolean,
  kicked: boolean
): { isTSpin: boolean; isMini: boolean } {
  if (mino.type !== 'T' || !isLastMoveRotation) {
    return { isTSpin: false, isMini: false };
  }

  // T-Spin is based on the 4 corners relative to the T-mino center.
  // In the 3x3 layout, the center is at (1,1).
  const cx = mino.position.x + 1;
  const cy = mino.position.y + 1;

  const corners = [
    { x: cx - 1, y: cy - 1 }, // Top-Left
    { x: cx + 1, y: cy - 1 }, // Top-Right
    { x: cx - 1, y: cy + 1 }, // Bottom-Left
    { x: cx + 1, y: cy + 1 }, // Bottom-Right
  ];

  let occupiedCount = 0;
  for (const corner of corners) {
    if (corner.x < 0 || corner.x >= BOARD_WIDTH || corner.y >= BOARD_HEIGHT) {
      occupiedCount++;
    } else if (corner.y >= 0 && board[corner.y][corner.x] !== null) {
      occupiedCount++;
    }
  }

  if (occupiedCount < 3) {
    return { isTSpin: false, isMini: false };
  }

  // mini T-Spin check
  // Define T-mino's facing corners and backing corners
  // facing corners: the corners pointing in the direction of the flat side (the two "pointing" corners)
  // E.g. rotation 0 (pointing up): flat side is at bottom, pointing corners are TL, TR
  // BACK corners are the corners behind the flat side.
  // Standard rule: If less than 2 facing corners are occupied, but it's a T-spin, it's Mini.
  // Unless the kick was the 5th test (offset 4, though we don't track kick index here explicitly, we can simplify).
  // A simpler way:
  // Rotation 0 (Pointing up): Back corners are TL, TR. Facing corners are BL, BR.
  // Rotation 1 (Pointing right): Back corners are TR, BR. Facing corners are TL, BL.
  // Rotation 2 (Pointing down): Back corners are BL, BR. Facing corners are TL, TR.
  // Rotation 3 (Pointing left): Back corners are TL, BL. Facing corners are TR, BR.
  
  let backCorners: Point[] = [];
  if (mino.rotation === 0) {
    backCorners = [{ x: cx - 1, y: cy - 1 }, { x: cx + 1, y: cy - 1 }];
  } else if (mino.rotation === 1) {
    backCorners = [{ x: cx + 1, y: cy - 1 }, { x: cx + 1, y: cy + 1 }];
  } else if (mino.rotation === 2) {
    backCorners = [{ x: cx - 1, y: cy + 1 }, { x: cx + 1, y: cy + 1 }];
  } else { // 3
    backCorners = [{ x: cx - 1, y: cy - 1 }, { x: cx - 1, y: cy + 1 }];
  }

  let backOccupied = 0;
  for (const corner of backCorners) {
    if (corner.x < 0 || corner.x >= BOARD_WIDTH || corner.y >= BOARD_HEIGHT) {
      backOccupied++;
    } else if (corner.y >= 0 && board[corner.y][corner.x] !== null) {
      backOccupied++;
    }
  }

  // If back corners are not fully occupied, and it was kicked, it might be Mini.
  // In typical guidelines, if back corners occupied == 2: regular T-Spin. If back corners occupied == 1: Mini T-Spin.
  const isMini = backOccupied < 2 && kicked;

  return { isTSpin: true, isMini };
}

export function lockMino(board: Board, mino: MinoState | null): Board {
  if (!mino) return board;
  const nextBoard = board.map(row => [...row]);
  const layout = MINO_LAYOUTS[mino.type][mino.rotation];
  for (const block of layout) {
    const x = mino.position.x + block.x;
    const y = mino.position.y + block.y;
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      nextBoard[y][x] = mino.type;
    }
  }
  return nextBoard;
}

export function clearLines(board: Board): { newBoard: Board; linesCleared: number } {
  const filtered = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - filtered.length;
  const emptyRows: Board = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(null));
  return {
    newBoard: [...emptyRows, ...filtered],
    linesCleared,
  };
}

export interface HardDropResult {
  nextState: GameState;
  bagState: BagState;
  linesCleared: number;
  tspinResult: { isTSpin: boolean; isMini: boolean };
}

export function hardDrop(
  gameState: GameState,
  bagState: BagState,
  isLastMoveRotation: boolean,
  kicked: boolean
): HardDropResult {
  if (!gameState.currentMino) {
    throw new Error('No active mino to hard drop');
  }
  const ghostPos = getGhostPosition(gameState.board, gameState.currentMino);
  const droppedMino: MinoState = { ...gameState.currentMino, position: ghostPos };

  // Check T-Spin before locking
  const tspinResult = checkTSpin(gameState.board, droppedMino, isLastMoveRotation, kicked);

  // Lock mino
  const lockedBoard = lockMino(gameState.board, droppedMino);

  // Clear lines
  const { newBoard, linesCleared } = clearLines(lockedBoard);

  // Pull next mino
  const { mino: nextMinoType, state: nextBagState } = pullNextMino(bagState);
  const nextMino: MinoState | null = nextMinoType ? {
    type: nextMinoType,
    rotation: 0,
    position: INITIAL_POSITIONS[nextMinoType],
  } : null;

  // Check game over (if next mino immediately overlaps)
  const isGameOver = nextMino ? !isValidPosition(newBoard, nextMino.type, nextMino.rotation, nextMino.position) : false;

  // Score calculation (simple guidelines)
  let baseScore = 0;
  if (tspinResult.isTSpin) {
    if (tspinResult.isMini) {
      baseScore = linesCleared === 1 ? 200 : 100;
    } else {
      if (linesCleared === 1) baseScore = 800;
      else if (linesCleared === 2) baseScore = 1200;
      else if (linesCleared === 3) baseScore = 1600;
      else baseScore = 400; // T-Spin with no lines cleared
    }
  } else {
    if (linesCleared === 1) baseScore = 100;
    else if (linesCleared === 2) baseScore = 300;
    else if (linesCleared === 3) baseScore = 500;
    else if (linesCleared === 4) baseScore = 800; // Tetris!
  }

  const newScore = gameState.score + baseScore;
  const newLinesCleared = gameState.linesCleared + linesCleared;

  const nextState: GameState = {
    board: newBoard,
    currentMino: nextMino,
    holdMino: gameState.holdMino,
    holdUsed: false,
    nextQueue: nextBagState.nextQueue,
    bag: nextBagState.bagPool,
    seed: nextBagState.seed,
    score: newScore,
    linesCleared: newLinesCleared,
    isGameOver,
  };

  return {
    nextState,
    bagState: nextBagState,
    linesCleared,
    tspinResult,
  };
}

export function holdMino(
  gameState: GameState,
  bagState: BagState
): { nextState: GameState; bagState: BagState; success: boolean } {
  if (gameState.holdUsed || !gameState.currentMino) {
    return { nextState: gameState, bagState, success: false };
  }

  const currentType = gameState.currentMino.type;
  let nextMinoType = gameState.holdMino;
  let nextBagState = bagState;

  if (nextMinoType === null) {
    // If hold was empty, pull a new mino from next queue
    const pull = pullNextMino(bagState);
    nextMinoType = pull.mino;
    nextBagState = pull.state;
  }

  const nextMino: MinoState = {
    type: nextMinoType,
    rotation: 0,
    position: INITIAL_POSITIONS[nextMinoType],
  };

  const nextState: GameState = {
    board: gameState.board,
    currentMino: nextMino,
    holdMino: currentType,
    holdUsed: true,
    nextQueue: nextBagState.nextQueue,
    bag: nextBagState.bagPool,
    seed: nextBagState.seed,
    score: gameState.score,
    linesCleared: gameState.linesCleared,
    isGameOver: !isValidPosition(gameState.board, nextMino.type, nextMino.rotation, nextMino.position),
  };

  return {
    nextState,
    bagState: nextBagState,
    success: true,
  };
}

export function getInitialGameState(seed: number): { gameState: GameState; bagState: BagState } {
  const bagState = getInitialBagState(seed);
  const { mino: firstMinoType, state: nextBagState } = pullNextMino(bagState);

  const initialMino: MinoState = {
    type: firstMinoType,
    rotation: 0,
    position: INITIAL_POSITIONS[firstMinoType],
  };

  const gameState: GameState = {
    board: createEmptyBoard(),
    currentMino: initialMino,
    holdMino: null,
    holdUsed: false,
    nextQueue: nextBagState.nextQueue,
    bag: nextBagState.bagPool,
    seed: nextBagState.seed,
    score: 0,
    linesCleared: 0,
    isGameOver: false,
  };

  return {
    gameState,
    bagState: nextBagState,
  };
}
