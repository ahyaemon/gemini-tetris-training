import { For } from 'solid-js';
import type { Component } from 'solid-js';
import type { MinoType } from '../core/types';

interface NextQueueProps {
  nextQueue: MinoType[];
}

const PREVIEW_LAYOUTS: Record<MinoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  T: [
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  L: [
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
};

export const NextQueue: Component<NextQueueProps> = (props) => {
  // Show next (1st) and next-next (2nd, 3rd)
  const displayedMinos = () => props.nextQueue.slice(0, 3);

  return (
    <div class="card">
      <h3 class="card-title">NEXT</h3>
      <div class="next-minos-list">
        <For each={displayedMinos()}>
          {(mino, index) => {
            const layout = PREVIEW_LAYOUTS[mino];
            const isFirst = index() === 0;
            return (
              <div 
                class="next-preview-item" 
                style={{ 
                  transform: isFirst ? 'scale(1)' : 'scale(0.8)',
                  opacity: isFirst ? 1 : 0.6,
                  margin: isFirst ? '0' : '-5px 0'
                }}
              >
                <div class="mino-preview-grid" style={{ margin: '5px' }}>
                  <For each={layout}>
                    {(row) => (
                      <For each={row}>
                        {(cell) => (
                          <div
                            class={`board-cell ${cell ? `cell-${mino}` : ''}`}
                          />
                        )}
                      </For>
                    )}
                  </For>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
