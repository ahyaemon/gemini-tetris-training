import { For, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { Board, MinoState, Point, MinoType } from '../core/types';
import { MINO_LAYOUTS, BOARD_WIDTH, BOARD_HEIGHT } from '../core/tetris';

interface TetrisBoardProps {
  board: Board;
  currentMino: MinoState | null;
  ghostPosition: Point;
  showGhost: boolean;
  guide: { minoType: MinoType; position: Point; rotation: number } | null;
  isGameOver: boolean;
  score: number;
  linesCleared: number;
}

function isMinoBlock(
  x: number,
  y: number,
  mino: { type: MinoType; rotation: number; position: Point } | null
): boolean {
  if (!mino) return false;
  const layout = MINO_LAYOUTS[mino.type][mino.rotation];
  return layout.some(
    block => mino.position.x + block.x === x && mino.position.y + block.y === y
  );
}

export const TetrisBoard: Component<TetrisBoardProps> = (props) => {
  const cells = () => {
    const grid = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        grid.push({ x, y });
      }
    }
    return grid;
  };

  const getCellClass = (x: number, y: number) => {
    // 1. Locked blocks
    const fixedCell = props.board[y][x];
    if (fixedCell) return `cell-${fixedCell}`;

    // 2. Active mino block
    if (props.currentMino && isMinoBlock(x, y, props.currentMino)) {
      return `cell-${props.currentMino.type}`;
    }

    // 3. Ghost mino block
    if (props.showGhost && props.currentMino) {
      const ghostMino = { ...props.currentMino, position: props.ghostPosition };
      if (isMinoBlock(x, y, ghostMino)) {
        return 'cell-ghost';
      }
    }

    // 4. Guide block (for pattern training)
    if (props.guide) {
      const guideMino = {
        type: props.guide.minoType,
        rotation: props.guide.rotation,
        position: props.guide.position,
      };
      if (isMinoBlock(x, y, guideMino)) {
        return 'cell-guide';
      }
    }

    return '';
  };

  const getGuideStyle = () => {
    if (!props.guide) return {};
    return {
      '--guide-color': `var(--color-${props.guide.minoType})`,
      '--guide-bg-color': `rgba(var(--color-${props.guide.minoType}-rgb, 162, 155, 254), 0.15)`,
    };
  };

  return (
    <div class="board-container">
      <div class="board-grid">
        <For each={cells()}>
          {(pos) => (
            <div
              class={`board-cell ${getCellClass(pos.x, pos.y)}`}
              style={getCellClass(pos.x, pos.y) === 'cell-guide' ? getGuideStyle() : {}}
            />
          )}
        </For>

        <Show when={props.isGameOver}>
          <div class="game-overlay">
            <div class="overlay-title">GAME OVER</div>
            <div class="overlay-desc">諦めずに練習を続けよう！</div>
          </div>
        </Show>
      </div>
    </div>
  );
};
