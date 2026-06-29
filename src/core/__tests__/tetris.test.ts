import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  isValidPosition,
  moveMino,
  rotateMino,
  getGhostPosition,
  clearLines,
  hardDrop,
  getInitialGameState,
  checkTSpin,
} from '../tetris';
import type { MinoState } from '../types';

describe('Tetris Core Logic', () => {
  it('should create an empty board', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(20);
    expect(board[0].length).toBe(10);
    expect(board.every(row => row.every(cell => cell === null))).toBe(true);
  });

  it('should check valid positions correctly', () => {
    const board = createEmptyBoard();
    // Valid spawn
    expect(isValidPosition(board, 'I', 0, { x: 3, y: 0 })).toBe(true);
    // Invalid (out of bounds left)
    expect(isValidPosition(board, 'I', 0, { x: -2, y: 0 })).toBe(false);
    // Invalid (out of bounds right)
    expect(isValidPosition(board, 'I', 0, { x: 8, y: 0 })).toBe(false);
    // Invalid (out of bounds bottom)
    expect(isValidPosition(board, 'I', 0, { x: 3, y: 19 })).toBe(false); // I vertical layout height
  });

  it('should move mino successfully when no collision', () => {
    const board = createEmptyBoard();
    const mino: MinoState = { type: 'T', rotation: 0, position: { x: 3, y: 5 } };

    const moved = moveMino(board, mino, { x: 1, y: 0 });
    expect(moved).not.toBeNull();
    expect(moved!.position).toEqual({ x: 4, y: 5 });

    const blocked = moveMino(board, mino, { x: -4, y: 0 });
    expect(blocked).toBeNull();
  });

  it('should calculate correct ghost position', () => {
    const board = createEmptyBoard();
    const mino: MinoState = { type: 'O', rotation: 0, position: { x: 4, y: 0 } };

    const ghost = getGhostPosition(board, mino);
    // For O mino, shape is 2x2. Placed at y=0, bottom blocks are at y=1.
    // Board height is 20, so bottom-most position should lock it with bottom blocks at y=19.
    // Meaning mino.position.y + 1 = 19 => mino.position.y = 18.
    expect(ghost).toEqual({ x: 4, y: 18 });
  });

  it('should clear lines when a row is full', () => {
    const board = createEmptyBoard();
    // Fill the bottom row
    for (let x = 0; x < 10; x++) {
      board[19][x] = 'I';
    }

    const { newBoard, linesCleared } = clearLines(board);
    expect(linesCleared).toBe(1);
    expect(newBoard[19].every(cell => cell === null)).toBe(true);
  });

  it('should process hard drop, lock block, clear lines and spawn next', () => {
    const seed = 456;
    const { gameState, bagState } = getInitialGameState(seed);
    const initialMino = gameState.currentMino;

    const res = hardDrop(gameState, bagState, false, false);
    // Board should have the locked mino blocks at the bottom
    expect(res.linesCleared).toBe(0);
    expect(res.nextState.currentMino).not.toEqual(initialMino);
    expect(res.nextState.score).toBe(0);
  });

  it('should test SRS wall kick', () => {
    const board = createEmptyBoard();
    // Set blocks to block rotation except if wall kicked
    // Let's create a T-mino stuck against the wall
    const mino: MinoState = { type: 'T', rotation: 0, position: { x: 0, y: 10 } };
    
    // Rotating counter-clockwise (0 -> 3).
    // T-mino shape at 0: center (1,1), left (0,1), right (2,1), top (1,0)
    // If x = 0, left block is at board x=0.
    // Rotating to 3 (pointing left): center (1,1), top (1,0), bottom (1,2), left (0,1)
    // Actually, T-mino rotation 0 -> 3 has kick offsets.
    // Let's test standard right rotation at the left border:
    // T-mino at x = -1 (so center (1,1) is at x=0, left block is at x=-1).
    // T rotation 0 has blocks at (0,1), (1,1), (2,1), (1,0) relative to pos.
    // If pos.x = -1, block (0,1) is at board x = -1 (out of bounds).
    // So pos.x = -1 is INVALID for rotation 0.
    // But if we rotate from 3 (pos.x=-1 is valid because rotation 3 has blocks at (1,1), (1,0), (1,2), (0,1). Wait, left block is still (0,1).
    // Let's test a simpler case: I-mino at the bottom or walls.
    // Just verify rotateMino returns kicked = true if kick is used.
    
    // Fill the wall at x=0,1 except a gap
    // Actually, SRS_KICK_DATA should shift the piece.
    // We rotate T-mino at x=0. Right rotation (0 -> 1):
    // Standard test 0 is (0,0). Test 1 is (-1,0) which kicks left.
    // But since x=0, kicking left (x=-1) is out of bounds!
    // Test 2 (-1,-1): also kicks left.
    // Test 3 (0,2): kicks down.
    // Let's check:
    const rotRes = rotateMino(board, mino, 'clockwise');
    expect(rotRes).not.toBeNull();
    // Since x=0, rotation 0->1: T-mino center at x=1.
    // Rotation 0: TL corner empty. Pos {x:0, y:10} -> blocks at (1,11), (0,11), (2,11), (1,10).
    // Rotation 1: blocks at (1,11), (1,10), (1,12), (2,11).
    // If we rotate without kick (0,0), it's valid at {x:0, y:10} because blocks are all x>=0.
    // So it won't kick. Let's make it kick by placing a block at (2,11).
    board[11][2] = 'I';
    const rotRes2 = rotateMino(board, mino, 'clockwise');
    expect(rotRes2).not.toBeNull();
    expect(rotRes2!.kicked).toBe(true); // Should have kicked to avoid the block at (2,11)
  });

  it('should detect T-Spin', () => {
    const board = createEmptyBoard();
    // Create T-Spin setup:
    // Put blocks around T-shape center.
    // T center is at (1,1). We place T-mino at {x: 3, y: 10}.
    // Center of T is at board (4, 11).
    // Corner points: (3, 10), (5, 10), (3, 12), (5, 12).
    // We block 3 of them:
    board[10][3] = 'I'; // Top-Left
    board[10][5] = 'I'; // Top-Right
    board[12][3] = 'I'; // Bottom-Left
    
    const mino: MinoState = { type: 'T', rotation: 0, position: { x: 3, y: 10 } };
    
    const check1 = checkTSpin(board, mino, true, false);
    expect(check1.isTSpin).toBe(true);
    expect(check1.isMini).toBe(false);
  });
});
