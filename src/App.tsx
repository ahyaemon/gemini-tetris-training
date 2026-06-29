import { createSignal, createEffect, onMount, onCleanup, For, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { GameState } from './core/types';
import {
  getInitialGameState,
  hardDrop,
  holdMino,
  moveMino,
  rotateMino,
  getGhostPosition,
  INITIAL_POSITIONS,
} from './core/tetris';
import { createHistoryStack, pushHistory, undo } from './core/history';
import type { HistoryStack } from './core/history';
import { PATTERN_DEFINITIONS } from './patterns/definitions';
import type { PatternDefinition } from './patterns/types';
import { TetrisBoard } from './components/TetrisBoard';
import { HoldQueue } from './components/HoldQueue';
import { NextQueue } from './components/NextQueue';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { PatternSelector } from './components/PatternSelector';
import './App.css';

interface Effect {
  id: number;
  text: string;
  type: 'tspin' | 'tetris' | 'perfect-clear' | 'correct' | 'incorrect' | 'completed';
}

export const App: Component = () => {
  // Simple Hash Routing: '#/free' or '#/patterns'
  const [hash, setHash] = createSignal(window.location.hash || '#/free');

  onMount(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/free');
    };
    window.addEventListener('hashchange', handleHashChange);
    onCleanup(() => window.removeEventListener('hashchange', handleHashChange));
  });

  const currentPage = () => (hash().startsWith('#/patterns') ? 'patterns' : 'free');

  // Game configuration
  const [seedInput, setSeedInput] = createSignal('777');
  const [activePattern, setActivePattern] = createSignal<PatternDefinition | null>(null);
  
  // Pattern training state
  const [currentStepIndex, setCurrentStepIndex] = createSignal(0);
  const [patternCompleted, setPatternCompleted] = createSignal(false);

  // Core Tetris state (controlled via history stack for undo support)
  const initialData = getInitialGameState(Number(seedInput()) || 777);
  const [history, setHistory] = createSignal<HistoryStack>(
    createHistoryStack(initialData.gameState, initialData.bagState)
  );

  // Active tracking for move flags to check T-Spins (T-Spin criteria requires last action to be rotation)
  const [isLastMoveRotation, setIsLastMoveRotation] = createSignal(false);
  const [wasKicked, setWasKicked] = createSignal(false);

  // UI Effects stack
  const [effects, setEffects] = createSignal<Effect[]>([]);
  let effectId = 0;

  const triggerEffect = (text: string, type: Effect['type']) => {
    const id = effectId++;
    setEffects((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 1000);
  };

  // Helper shortcuts to extract current state
  const currentGameState = () => history().present.gameState;
  const currentBagState = () => history().present.bagState;
  const ghostY = () => getGhostPosition(currentGameState().board, currentGameState().currentMino);

  // Initialize/Restart Free Practice Mode
  const startFreePractice = (customSeed?: number) => {
    const activeSeed = customSeed !== undefined ? customSeed : Number(seedInput()) || 777;
    const initial = getInitialGameState(activeSeed);
    setHistory(createHistoryStack(initial.gameState, initial.bagState));
    setIsLastMoveRotation(false);
    setWasKicked(false);
    setPatternCompleted(false);
    setCurrentStepIndex(0);
    triggerEffect('スタート！', 'correct');
  };

  // Initialize/Restart Pattern Practice Mode
  const startPatternPractice = (pattern: PatternDefinition) => {
    setActivePattern(pattern);
    setCurrentStepIndex(0);
    setPatternCompleted(false);

    // Initial game state setup based on the pattern preset
    const initial = getInitialGameState(pattern.seed);
    
    // We override the initial board and enforce the specific sequence
    const customGameState: GameState = {
      ...initial.gameState,
      board: pattern.initialBoard.map(row => [...row]),
      // Force first mino matching the first step
      currentMino: {
        type: pattern.steps[0].minoType,
        rotation: 0,
        position: { ...INITIAL_POSITIONS[pattern.steps[0].minoType] } // spawn centrally
      },
      // Force next queues to match subsequent steps
      nextQueue: pattern.steps.map(s => s.minoType).slice(1),
      isGameOver: false
    };

    // Override the bag state queue to avoid random minos
    const customBagState = {
      ...initial.bagState,
      nextQueue: pattern.steps.map(s => s.minoType).slice(1),
      bagPool: [] // Empty pool since sequence is fixed
    };

    setHistory(createHistoryStack(customGameState, customBagState));
    setIsLastMoveRotation(false);
    setWasKicked(false);
    
    triggerEffect(`${pattern.name} 練習開始！`, 'correct');
  };

  // Track active guide template block
  const currentGuide = () => {
    const pattern = activePattern();
    if (currentPage() !== 'patterns' || !pattern || patternCompleted()) return null;
    const step = pattern.steps[currentStepIndex()];
    if (!step) return null;
    return {
      minoType: step.minoType,
      position: step.position,
      rotation: step.rotation,
    };
  };

  // Check if board has been completely cleared
  const isPerfectClear = (board: any[][]) => {
    return board.every(row => row.every(cell => cell === null));
  };

  // Inputs Handlers
  const handleLeft = () => {
    if (currentGameState().isGameOver || patternCompleted()) return;
    const next = moveMino(currentGameState().board, currentGameState().currentMino, { x: -1, y: 0 });
    if (next) {
      const nextState = { ...currentGameState(), currentMino: next };
      setHistory(pushHistory(history(), nextState, currentBagState(), false, false));
      setIsLastMoveRotation(false);
    }
  };

  const handleRight = () => {
    if (currentGameState().isGameOver || patternCompleted()) return;
    const next = moveMino(currentGameState().board, currentGameState().currentMino, { x: 1, y: 0 });
    if (next) {
      const nextState = { ...currentGameState(), currentMino: next };
      setHistory(pushHistory(history(), nextState, currentBagState(), false, false));
      setIsLastMoveRotation(false);
    }
  };

  const handleSoftDrop = () => {
    if (currentGameState().isGameOver || patternCompleted()) return;
    const next = moveMino(currentGameState().board, currentGameState().currentMino, { x: 0, y: 1 });
    if (next) {
      const nextState = { ...currentGameState(), currentMino: next };
      setHistory(pushHistory(history(), nextState, currentBagState(), false, false));
      setIsLastMoveRotation(false);
    }
  };

  const handleRotateCW = () => {
    if (currentGameState().isGameOver || patternCompleted()) return;
    const result = rotateMino(currentGameState().board, currentGameState().currentMino, 'clockwise');
    if (result) {
      const nextState = { ...currentGameState(), currentMino: result.mino };
      setHistory(pushHistory(history(), nextState, currentBagState(), true, result.kicked));
      setIsLastMoveRotation(true);
      setWasKicked(result.kicked);
    }
  };

  const handleRotateCCW = () => {
    if (currentGameState().isGameOver || patternCompleted()) return;
    const result = rotateMino(currentGameState().board, currentGameState().currentMino, 'counter-clockwise');
    if (result) {
      const nextState = { ...currentGameState(), currentMino: result.mino };
      setHistory(pushHistory(history(), nextState, currentBagState(), true, result.kicked));
      setIsLastMoveRotation(true);
      setWasKicked(result.kicked);
    }
  };

  const handleHold = () => {
    if (currentGameState().isGameOver || patternCompleted() || currentPage() === 'patterns') return;
    const res = holdMino(currentGameState(), currentBagState());
    if (res.success) {
      setHistory(pushHistory(history(), res.nextState, res.bagState, false, false));
      setIsLastMoveRotation(false);
    }
  };

  const handleUndo = () => {
    if (patternCompleted()) return;
    const prev = undo(history());
    if (prev !== history()) {
      setHistory(prev);
      setIsLastMoveRotation(prev.present.isLastMoveRotation);
      setWasKicked(prev.present.kicked);
    }
  };

  const handleHardDrop = () => {
    const state = currentGameState();
    if (state.isGameOver || patternCompleted() || !state.currentMino) return;

    // Pattern Validation logic if in training mode
    if (currentPage() === 'patterns') {
      const pattern = activePattern();
      const guide = currentGuide();

      if (pattern && guide) {
        const activeMino = state.currentMino;
        const finalGhost = getGhostPosition(state.board, activeMino);

        // Check if placed position & rotation match target step coordinates
        const matchesPosition =
          finalGhost.x === guide.position.x && finalGhost.y === guide.position.y;
        const matchesRotation = activeMino.rotation === guide.rotation;

        if (matchesPosition && matchesRotation) {
          // Success Placement!
          triggerEffect('Nice!', 'correct');
          
          const nextIndex = currentStepIndex() + 1;
          if (nextIndex >= pattern.steps.length) {
            // Completed all steps!
            setPatternCompleted(true);
            triggerEffect('定石完成！✨', 'completed');
            
            // Generate drop to finish representation on board
            const res = hardDrop(state, currentBagState(), isLastMoveRotation(), wasKicked());
            setHistory(pushHistory(history(), { ...res.nextState, isGameOver: false }, res.bagState, false, false));
          } else {
            // Move to next step
            setCurrentStepIndex(nextIndex);
            
            // Place mino, advance step, override next mino to match new step
            const res = hardDrop(state, currentBagState(), isLastMoveRotation(), wasKicked());
            
            const nextStep = pattern.steps[nextIndex];
            const updatedGameState: GameState = {
              ...res.nextState,
              // Force next mino to be exactly what step expects
              currentMino: {
                type: nextStep.minoType,
                rotation: 0,
                position: { ...INITIAL_POSITIONS[nextStep.minoType] }
              },
              // Force subsequent next queue
              nextQueue: pattern.steps.map(s => s.minoType).slice(nextIndex + 1),
            };

            const updatedBagState = {
              ...res.bagState,
              nextQueue: pattern.steps.map(s => s.minoType).slice(nextIndex + 1),
            };

            setHistory(pushHistory(history(), updatedGameState, updatedBagState, false, false));
          }
        } else {
          // Fail placement (misplacement) -> warn and auto undo
          triggerEffect('置きミス！自動で一手戻るよ', 'incorrect');
          // No history stack update, user remains at start of active mino turn
        }
        return;
      }
    }

    // Standard Hard Drop (Free Practice Mode)
    const res = hardDrop(state, currentBagState(), isLastMoveRotation(), wasKicked());
    setHistory(pushHistory(history(), res.nextState, res.bagState, false, false));
    setIsLastMoveRotation(false);
    setWasKicked(false);

    // Score effect feedback
    if (isPerfectClear(res.nextState.board)) {
      triggerEffect('PERFECT CLEAR!', 'perfect-clear');
    } else if (res.tspinResult.isTSpin) {
      triggerEffect(res.tspinResult.isMini ? 'T-Spin Mini!' : 'T-Spin!', 'tspin');
    } else if (res.linesCleared === 4) {
      triggerEffect('TETRIS!', 'tetris');
    } else if (res.linesCleared > 0) {
      triggerEffect(`${res.linesCleared} Lines`, 'correct');
    }
  };

  // Keyboard listeners binding
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid browser scrolling on space/arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowLeft':
          handleLeft();
          break;
        case 'ArrowRight':
          handleRight();
          break;
        case 'ArrowDown':
          handleSoftDrop();
          break;
        case 'ArrowUp':
        case 'Space':
          handleHardDrop();
          break;
        case 'KeyZ':
          handleRotateCCW();
          break;
        case 'KeyX':
          handleRotateCW();
          break;
        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          handleHold();
          break;
        case 'Backspace':
          handleUndo();
          break;
        case 'KeyR':
          if (currentPage() === 'patterns' && activePattern()) {
            startPatternPractice(activePattern()!);
          } else {
            startFreePractice();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  // Mobile controller integration
  const handleMobileAction = (action: string) => {
    switch (action) {
      case 'left': handleLeft(); break;
      case 'right': handleRight(); break;
      case 'down': handleSoftDrop(); break;
      case 'rotateL': handleRotateCCW(); break;
      case 'rotateR': handleRotateCW(); break;
      case 'hold': handleHold(); break;
      case 'undo': handleUndo(); break;
      case 'hardDrop': handleHardDrop(); break;
    }
  };

  // Auto start on mount
  onMount(() => {
    startFreePractice();
  });

  // Keep game synchronized if mode changes via router
  createEffect(() => {
    const page = currentPage();
    if (page === 'free') {
      setActivePattern(null);
      startFreePractice();
    } else if (page === 'patterns' && !activePattern()) {
      // auto select first pattern if none selected
      startPatternPractice(PATTERN_DEFINITIONS[0]);
    }
  });

  return (
    <div class="app-container">
      {/* Header */}
      <header class="app-header">
        <div class="logo">
          <h1>TETRIS TRAINING</h1>
        </div>
        <nav class="nav-links">
          <a
            href="#/free"
            class={`nav-button ${currentPage() === 'free' ? 'active' : ''}`}
          >
            フリー練習
          </a>
          <a
            href="#/patterns"
            class={`nav-button ${currentPage() === 'patterns' ? 'active' : ''}`}
          >
            定石練習
          </a>
        </nav>
      </header>

      {/* Main Container */}
      <main class="main-content">
        <Show
          when={currentPage() === 'free'}
          fallback={
            <div style={{ width: '100%' }}>
              <PatternSelector
                activePatternId={activePattern()?.id || null}
                onSelect={(pattern) => startPatternPractice(pattern)}
              />
            </div>
          }
        >
          {/* Free Practice Setup Seeds */}
          <div class="card" style={{ width: '100%', "max-width": '540px', "margin-bottom": '1.5rem' }}>
            <h3 class="card-title">シード設定</h3>
            <div class="seed-control">
              <input
                type="number"
                class="seed-input"
                value={seedInput()}
                onInput={(e) => setSeedInput(e.currentTarget.value)}
                placeholder="シード値 (数値)"
              />
              <button class="btn" onClick={() => startFreePractice()}>
                シード固定で開始
              </button>
              <button
                class="btn btn-secondary"
                onClick={() => {
                  const randomSeed = Math.floor(Math.random() * 999999);
                  setSeedInput(String(randomSeed));
                  startFreePractice(randomSeed);
                }}
              >
                ランダムシード
              </button>
            </div>
          </div>
        </Show>

        {/* Game Main Area */}
        <div class="game-layout" style={{ "margin-top": currentPage() === 'patterns' ? '1.5rem' : '0' }}>
          {/* Left panel: Hold */}
          <div class="side-panel">
            <Show
              when={currentPage() === 'free'}
              fallback={
                <div class="card">
                  <h3 class="card-title">定石ガイド</h3>
                  <div style={{ "font-size": '0.9rem', "line-height": '1.4' }}>
                    <p style={{ "font-weight": 'bold', color: '#a29bfe', margin: '0 0 8px 0' }}>
                      {activePattern()?.name}
                    </p>
                    <p style={{ margin: '0' }}>
                      {patternCompleted() ? (
                        <span style={{ color: '#2ecc71', "font-weight": 'bold' }}>完成！お見事！🎉</span>
                      ) : (
                        <span>
                          <strong>手順 {currentStepIndex() + 1} / {activePattern()?.steps.length}:</strong>
                          <br />
                          {activePattern()?.steps[currentStepIndex()]?.description}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              }
            >
              <HoldQueue
                holdMino={currentGameState().holdMino}
                holdUsed={currentGameState().holdUsed}
              />
            </Show>

            <div class="card controls-card">
              <h3 class="card-title">操作キー</h3>
              <div class="key-list">
                <div class="key-item">
                  <span>左移動</span>
                  <span class="key-cap">←</span>
                </div>
                <div class="key-item">
                  <span>右移動</span>
                  <span class="key-cap">→</span>
                </div>
                <div class="key-item">
                  <span>下移動</span>
                  <span class="key-cap">↓</span>
                </div>
                <div class="key-item">
                  <span>接地</span>
                  <span class="key-cap">Space</span> / <span class="key-cap">↑</span>
                </div>
                <div class="key-item">
                  <span>右回転</span>
                  <span class="key-cap">X</span>
                </div>
                <div class="key-item">
                  <span>左回転</span>
                  <span class="key-cap">Z</span>
                </div>
                <Show when={currentPage() === 'free'}>
                  <div class="key-item">
                    <span>ホールド</span>
                    <span class="key-cap">Shift</span> / <span class="key-cap">C</span>
                  </div>
                </Show>
                <div class="key-item">
                  <span>一手戻る</span>
                  <span class="key-cap">Backspace</span>
                </div>
                <div class="key-item">
                  <span>リスタート</span>
                  <span class="key-cap">R</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Tetris Board */}
          <div style={{ position: 'relative' }}>
            {/* Visual effects overlay */}
            <div class="effects-container">
              <For each={effects()}>
                {(effect) => (
                  <div class={`effect-badge ${effect.type}`}>
                    {effect.text}
                  </div>
                )}
              </For>
            </div>

            <TetrisBoard
              board={currentGameState().board}
              currentMino={currentGameState().currentMino}
              ghostPosition={ghostY()}
              showGhost={true}
              guide={currentGuide()}
              isGameOver={currentGameState().isGameOver}
              score={currentGameState().score}
              linesCleared={currentGameState().linesCleared}
            />

            <Show when={patternCompleted()}>
              <div class="game-overlay">
                <div class="overlay-title" style={{ color: '#2ecc71' }}>SUCCESS!</div>
                <div class="overlay-desc">定石を美しく完成させたよ！</div>
                <div class="button-group">
                  <button
                    class="btn"
                    onClick={() => startPatternPractice(activePattern()!)}
                  >
                    もう一回練習する
                  </button>
                </div>
              </div>
            </Show>
          </div>

          {/* Right panel: Next Queue & Stats */}
          <div class="side-panel">
            <NextQueue nextQueue={currentGameState().nextQueue} />

            <div class="card">
              <h3 class="card-title">ステータス</h3>
              <div style={{ "display": 'flex', "flex-direction": 'column', gap: '10px' }}>
                <Show when={currentPage() === 'free'}>
                  <div>
                    <span style={{ "font-size": '0.8rem', color: 'var(--text-muted)' }}>SCORE</span>
                    <div style={{ "font-size": '1.5rem', "font-weight": '800' }}>
                      {currentGameState().score}
                    </div>
                  </div>
                </Show>
                <div>
                  <span style={{ "font-size": '0.8rem', color: 'var(--text-muted)' }}>CLEARED LINES</span>
                  <div style={{ "font-size": '1.5rem', "font-weight": '800' }}>
                    {currentGameState().linesCleared}
                  </div>
                </div>
              </div>
              
              <div class="button-group" style={{ "margin-top": '1.5rem' }}>
                <button
                  class="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={handleUndo}
                >
                  ↩ 一手戻る
                </button>
              </div>
              <div class="button-group">
                <button
                  class="btn btn-danger"
                  style={{ width: '100%' }}
                  onClick={() => {
                    if (currentPage() === 'patterns' && activePattern()) {
                      startPatternPractice(activePattern()!);
                    } else {
                      startFreePractice();
                    }
                  }}
                >
                  ↻ リセット
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Smartphone layout keyboard */}
        <VirtualKeyboard onAction={handleMobileAction} />
      </main>
    </div>
  );
};
