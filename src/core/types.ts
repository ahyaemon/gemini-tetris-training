export type MinoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type Cell = MinoType | null;

export type Board = Cell[][]; // 20 rows x 10 cols

export interface Point {
  x: number;
  y: number;
}

export interface MinoState {
  type: MinoType;
  rotation: number; // 0: initial, 1: 90 deg (clockwise), 2: 180 deg, 3: 270 deg (counter-clockwise)
  position: Point;  // Position of the mino's anchor on the board
}

export interface GameState {
  board: Board;
  currentMino: MinoState;
  holdMino: MinoType | null;
  holdUsed: boolean;
  nextQueue: MinoType[];
  bag: MinoType[];
  seed: number;
  score: number;
  linesCleared: number;
  isGameOver: boolean;
}
