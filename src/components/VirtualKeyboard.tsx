import type { Component } from 'solid-js';

interface VirtualKeyboardProps {
  onAction: (action: string) => void;
}

export const VirtualKeyboard: Component<VirtualKeyboardProps> = (props) => {
  const handlePress = (action: string, e: Event) => {
    e.preventDefault();
    props.onAction(action);
  };

  return (
    <div class="virtual-keyboard">
      {/* Utility row */}
      <div class="keyboard-row">
        <button 
          class="kb-btn kb-btn-accent" 
          onClick={[handlePress, 'undo']}
          onTouchStart={[handlePress, 'undo']}
        >
          一手戻る (Undo)
        </button>
        <button 
          class="kb-btn kb-btn-accent" 
          onClick={[handlePress, 'hold']}
          onTouchStart={[handlePress, 'hold']}
        >
          ホールド (Hold)
        </button>
      </div>

      {/* Rotation & Hard drop row */}
      <div class="keyboard-row">
        <button 
          class="kb-btn" 
          onClick={[handlePress, 'rotateL']}
          onTouchStart={[handlePress, 'rotateL']}
        >
          左回転 (Z)
        </button>
        <button 
          class="kb-btn kb-btn-large kb-btn-accent" 
          onClick={[handlePress, 'hardDrop']}
          onTouchStart={[handlePress, 'hardDrop']}
        >
          ハードドロップ (Space)
        </button>
        <button 
          class="kb-btn" 
          onClick={[handlePress, 'rotateR']}
          onTouchStart={[handlePress, 'rotateR']}
        >
          右回転 (X)
        </button>
      </div>

      {/* Directional row */}
      <div class="keyboard-row">
        <button 
          class="kb-btn" 
          onClick={[handlePress, 'left']}
          onTouchStart={[handlePress, 'left']}
        >
          ← 左移動
        </button>
        <button 
          class="kb-btn" 
          onClick={[handlePress, 'down']}
          onTouchStart={[handlePress, 'down']}
        >
          ↓ 下移動
        </button>
        <button 
          class="kb-btn" 
          onClick={[handlePress, 'right']}
          onTouchStart={[handlePress, 'right']}
        >
          右移動 →
        </button>
      </div>
    </div>
  );
};
