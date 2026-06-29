import type { Board, MinoType, Point } from '../core/types';

export interface PatternStep {
  minoType: MinoType;
  position: Point; // Target top-left anchor position
  rotation: number; // Target rotation (0, 1, 2, 3)
  description?: string; // Optional tip for the player
}

export interface PatternDefinition {
  id: string;
  name: string;
  description: string;
  initialBoard: Board;
  seed: number; // Seed to guarantee the mino queue matches the steps
  steps: PatternStep[]; // Expected placement for each mino step
}
