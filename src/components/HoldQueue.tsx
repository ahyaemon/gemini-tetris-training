import { For, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { MinoType } from '../core/types';

interface HoldQueueProps {
  holdMino: MinoType | null;
  holdUsed: boolean;
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

export const HoldQueue: Component<HoldQueueProps> = (props) => {
  return (
    <div class="card" style={{ opacity: props.holdUsed ? 0.6 : 1 }}>
      <h3 class="card-title">HOLD</h3>
      <Show
        when={props.holdMino}
        fallback={
          <div class="mino-preview-grid">
            <For each={Array(16)}>
              {() => <div class="board-cell" />}
            </For>
          </div>
        }
      >
        {(mino) => {
          const layout = PREVIEW_LAYOUTS[mino()];
          return (
            <div class="mino-preview-grid">
              <For each={layout}>
                {(row) => (
                  <For each={row}>
                    {(cell) => (
                      <div
                        class={`board-cell ${cell ? `cell-${mino()}` : ''}`}
                      />
                    )}
                  </For>
                )}
              </For>
            </div>
          );
        }}
      </Show>
    </div>
  );
};
