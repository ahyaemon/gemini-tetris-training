import type { GameState } from './types';
import type { BagState } from './bag';

export interface HistoryItem {
  gameState: GameState;
  bagState: BagState;
  isLastMoveRotation: boolean;
  kicked: boolean;
}

export interface HistoryStack {
  past: HistoryItem[];
  present: HistoryItem;
  future: HistoryItem[];
}

export function createHistoryStack(gameState: GameState, bagState: BagState): HistoryStack {
  return {
    past: [],
    present: { gameState, bagState, isLastMoveRotation: false, kicked: false },
    future: [],
  };
}

export function pushHistory(
  stack: HistoryStack,
  gameState: GameState,
  bagState: BagState,
  isLastMoveRotation: boolean,
  kicked: boolean
): HistoryStack {
  return {
    past: [...stack.past, stack.present],
    present: {
      gameState,
      bagState,
      isLastMoveRotation,
      kicked,
    },
    future: [], // Clear redo history on new action
  };
}

export function undo(stack: HistoryStack): HistoryStack {
  if (stack.past.length === 0) return stack;
  const previous = stack.past[stack.past.length - 1];
  const newPast = stack.past.slice(0, stack.past.length - 1);
  return {
    past: newPast,
    present: previous,
    future: [stack.present, ...stack.future],
  };
}

export function redo(stack: HistoryStack): HistoryStack {
  if (stack.future.length === 0) return stack;
  const next = stack.future[0];
  const newFuture = stack.future.slice(1);
  return {
    past: [...stack.past, stack.present],
    present: next,
    future: newFuture,
  };
}
