import { For } from 'solid-js';
import type { Component } from 'solid-js';
import type { PatternDefinition } from '../patterns/types';
import { PATTERN_DEFINITIONS } from '../patterns/definitions';

interface PatternSelectorProps {
  activePatternId: string | null;
  onSelect: (pattern: PatternDefinition) => void;
}

export const PatternSelector: Component<PatternSelectorProps> = (props) => {
  return (
    <div class="pattern-selection-container">
      <For each={PATTERN_DEFINITIONS}>
        {(pattern) => {
          const isActive = () => props.activePatternId === pattern.id;
          return (
            <div
              class={`card pattern-card ${isActive() ? 'active' : ''}`}
              onClick={() => props.onSelect(pattern)}
            >
              <h4 class="pattern-title">{pattern.name}</h4>
              <p class="pattern-desc">{pattern.description}</p>
              <div class="pattern-meta">
                <span>手順数: {pattern.steps.length} 手</span>
                <span>練習開始 →</span>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
};
