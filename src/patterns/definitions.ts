import type { PatternDefinition } from './types';
import { createEmptyBoard } from '../core/tetris';

function fillCells(board: any[][], cells: { x: number; y: number; type: any }[]): any[][] {
  const nextBoard = board.map(row => [...row]);
  for (const cell of cells) {
    if (cell.y >= 0 && cell.y < 20 && cell.x >= 0 && cell.x < 10) {
      nextBoard[cell.y][cell.x] = cell.type;
    }
  }
  return nextBoard;
}

export const PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    id: 'dt-cannon',
    name: 'DT砲 (DT Cannon)',
    description: 'TSDを決めた直後にTSTを決める超強力コンボ。実際にT-Spin DoubleとT-Spin Tripleを撃ち込んでラインを消去する練習をします。',
    seed: 301,
    initialBoard: fillCells(createEmptyBoard(), [
      // 1st Bag Base
      { x: 0, y: 19, type: 'O' }, { x: 1, y: 19, type: 'O' },
      { x: 0, y: 18, type: 'O' }, { x: 1, y: 18, type: 'O' },
      { x: 2, y: 19, type: 'J' }, { x: 3, y: 19, type: 'J' }, { x: 4, y: 19, type: 'J' },
      { x: 2, y: 18, type: 'J' },
      { x: 3, y: 18, type: 'Z' }, { x: 4, y: 18, type: 'Z' },
      { x: 3, y: 17, type: 'Z' }, { x: 2, y: 17, type: 'Z' },
      
      { x: 5, y: 19, type: 'L' }, { x: 6, y: 19, type: 'L' }, { x: 7, y: 19, type: 'L' },
      { x: 7, y: 18, type: 'L' },
      { x: 5, y: 18, type: 'S' }, { x: 6, y: 18, type: 'S' },
      { x: 6, y: 17, type: 'S' }, { x: 7, y: 17, type: 'S' },
      
      { x: 8, y: 19, type: 'I' }, { x: 8, y: 18, type: 'I' }, { x: 8, y: 17, type: 'I' }, { x: 8, y: 16, type: 'I' },
      
      // 2nd Bag TST Roof & Cover (Left side)
      { x: 0, y: 15, type: 'L' }, { x: 1, y: 15, type: 'L' }, { x: 1, y: 14, type: 'L' }, { x: 1, y: 13, type: 'L' },
      { x: 2, y: 15, type: 'J' }, { x: 2, y: 16, type: 'J' }, { x: 2, y: 17, type: 'J' },
      { x: 3, y: 15, type: 'J' }, // TST Overhang roof at (3,15)
    ]),
    steps: [
      {
        minoType: 'T',
        // TSD slot at 9th column (x=9, bottom-most).
        // T-mino should be pointing right (rotation 1) to fit without blocking the left.
        // Anchor center at x=8, y=18 (for rotation 1, center is (1,1), so position.x=7, position.y=17).
        position: { x: 7, y: 17 },
        rotation: 1,
        description: 'Tミノを右回転（回転1）して、右端の隙間に滑り込ませてT-Spin Double（TSD）を決めよう！',
      },
      {
        minoType: 'T',
        // TST slot at 2nd column (x=2).
        // Under the overhang roof at x=3, y=15.
        // T-mino pointing left (rotation 3) to wallkick inside.
        // Center at x=2, y=16. position.x = 1, position.y = 15.
        // Note: after TSD clears 2 lines, the board shifts down, so the target coordinates shift.
        // TSD clears 2 lines, so the roof at y=15 shifts down to y=17.
        // Thus, the new target position for TST is position.y = 15 + 2 = 17.
        position: { x: 1, y: 17 },
        rotation: 3,
        description: '次のTミノを左回転（回転3）させて、左側のTST穴に回転入れ（T-Spin Triple）を決めよう！',
      },
    ],
  },
  {
    id: 'opening-tsd',
    name: '開幕TSD (Opening TSD)',
    description: '1巡目にT-Spin Doubleを最速で放つテンプレ。滑り込ませて実際に2ライン消去する練習をします。',
    seed: 302,
    initialBoard: fillCells(createEmptyBoard(), [
      // Left stack
      { x: 0, y: 19, type: 'L' }, { x: 1, y: 19, type: 'L' }, { x: 2, y: 19, type: 'L' },
      { x: 0, y: 18, type: 'L' },
      // Right stack
      { x: 5, y: 19, type: 'J' }, { x: 6, y: 19, type: 'J' }, { x: 7, y: 19, type: 'J' },
      { x: 7, y: 18, type: 'J' },
      // Overhang at x=4
      { x: 4, y: 17, type: 'O' }, { x: 4, y: 18, type: 'O' },
      // Surroundings to ensure line clear
      { x: 8, y: 19, type: 'I' }, { x: 9, y: 19, type: 'I' },
      { x: 8, y: 18, type: 'I' }, { x: 9, y: 18, type: 'I' },
    ]),
    steps: [
      {
        minoType: 'T',
        // T-mino pointing down (rotation 2) placed under the overhang.
        // Center at x=3, y=18 => position {x:2, y:17}
        position: { x: 2, y: 17 },
        rotation: 2,
        description: 'Tミノを逆さま（回転2）にして、中央の隙間に滑り込ませてT-Spin Doubleを決めてね！',
      },
    ],
  },
  {
    id: 'perfect-clear',
    name: 'パフェ積み (Perfect Clear)',
    description: '盤面のすべてのブロックを消去する全消し。最後の1手でパフェを達成して全消しエフェクトを発生させます。',
    seed: 303,
    initialBoard: fillCells(createEmptyBoard(), [
      // Full rows except a 4-block gap that perfectly fits a horizontal T-mino
      { x: 0, y: 19, type: 'I' }, { x: 1, y: 19, type: 'I' }, { x: 2, y: 19, type: 'I' }, { x: 3, y: 19, type: 'I' },
      { x: 0, y: 18, type: 'O' }, { x: 1, y: 18, type: 'O' }, { x: 2, y: 18, type: 'L' }, { x: 3, y: 18, type: 'L' },
      { x: 0, y: 17, type: 'O' }, { x: 1, y: 17, type: 'O' }, { x: 2, y: 17, type: 'L' },
      { x: 0, y: 16, type: 'S' }, { x: 1, y: 16, type: 'S' },
      { x: 1, y: 15, type: 'S' },
      // Right side setup
      { x: 6, y: 19, type: 'Z' }, { x: 7, y: 19, type: 'Z' }, { x: 8, y: 19, type: 'Z' }, { x: 9, y: 19, type: 'Z' },
      { x: 6, y: 18, type: 'Z' }, { x: 7, y: 18, type: 'J' }, { x: 8, y: 18, type: 'J' }, { x: 9, y: 18, type: 'J' },
      { x: 7, y: 17, type: 'J' },
      // Extra blocks to fill columns 4, 5 on top rows, leaving a clean T-shape gap at bottom
      { x: 4, y: 19, type: 'T' }, { x: 5, y: 19, type: 'T' }, // wait, bottom row needs to be full
    ]).map((row, y) => {
      // Manual adjustment to make sure exactly 4 lines are filled except the T-slot
      // Let's just define it cleanly: 4 rows filled completely, except a T-shape gap at the bottom middle.
      // T-shape gap at x=3,4,5, y=19 and x=4, y=18.
      if (y >= 16 && y <= 19) {
        return row.map((_, x) => {
          // Leave T-shape empty: (3,19), (4,19), (5,19) and (4,18)
          if ((y === 19 && (x === 3 || x === 4 || x === 5)) || (y === 18 && x === 4)) {
            return null;
          }
          return 'I'; // fill everything else with gray I blocks
        });
      }
      return row;
    }),
    steps: [
      {
        minoType: 'T',
        // T-mino placed pointing up (rotation 0) in the middle gap
        // Center at x=4, y=18 => position {x:3, y:17}
        position: { x: 3, y: 17 },
        rotation: 0,
        description: 'Tミノを中央のT字の隙間に綺麗にはめ込んで、パーフェクトクリア（全消し）を達成しよう！',
      },
    ],
  },
  {
    id: 'albatross-tsd',
    name: 'アルバトロス (Albatross TSD)',
    description: '空中戦とも呼ばれる変則的なTSD。Tミノを回転ねじ込みして実際に消去します。',
    seed: 304,
    initialBoard: fillCells(createEmptyBoard(), [
      { x: 0, y: 19, type: 'O' }, { x: 1, y: 19, type: 'O' }, { x: 2, y: 19, type: 'J' }, { x: 3, y: 19, type: 'J' },
      { x: 0, y: 18, type: 'O' }, { x: 1, y: 18, type: 'O' }, { x: 3, y: 18, type: 'J' },
      { x: 7, y: 19, type: 'L' }, { x: 8, y: 19, type: 'L' }, { x: 9, y: 19, type: 'L' },
      { x: 7, y: 18, type: 'L' },
      // Overhang
      { x: 4, y: 17, type: 'Z' }, { x: 5, y: 17, type: 'Z' }, { x: 5, y: 18, type: 'Z' }, { x: 6, y: 18, type: 'Z' },
      // Fill sides to clear lines
      { x: 8, y: 18, type: 'I' }, { x: 9, y: 18, type: 'I' },
    ]),
    steps: [
      {
        minoType: 'T',
        // TSD slot under Z-overhang.
        // Rotation 1 (pointing right), center at x=2, y=17 => position {x:1, y:16}
        position: { x: 1, y: 16 },
        rotation: 1,
        description: 'Tミノを右回転（回転1）させて、右側の隙間に滑り込ませてT-Spin Doubleを決めよう！',
      },
    ],
  },
  {
    id: 'yoshihiro-tsd',
    name: '八尾積み (Yoshihiro TSD)',
    description: '安定してTSDを撃てる綺麗な開幕テンプレ。TミノをスライドしてT-Spin Doubleを撃ちます。',
    seed: 305,
    initialBoard: fillCells(createEmptyBoard(), [
      { x: 0, y: 19, type: 'I' }, { x: 1, y: 19, type: 'I' }, { x: 2, y: 19, type: 'I' }, { x: 3, y: 19, type: 'I' },
      { x: 0, y: 18, type: 'L' }, { x: 1, y: 18, type: 'L' }, { x: 2, y: 18, type: 'L' },
      { x: 0, y: 17, type: 'L' },
      // Right side
      { x: 7, y: 19, type: 'J' }, { x: 8, y: 19, type: 'J' }, { x: 9, y: 19, type: 'J' },
      { x: 7, y: 18, type: 'J' }, { x: 8, y: 18, type: 'J' }, { x: 9, y: 18, type: 'J' },
      // Overhang
      { x: 5, y: 17, type: 'O' }, { x: 6, y: 17, type: 'O' },
      { x: 5, y: 18, type: 'O' }, { x: 6, y: 18, type: 'O' },
    ]),
    steps: [
      {
        minoType: 'T',
        // T-mino pointing down (rotation 2) under O-overhang.
        // Center at x=4, y=18 => position {x:3, y:17}
        position: { x: 3, y: 17 },
        rotation: 2,
        description: 'Tミノを逆さま（回転2）にして、Oミノの屋根の下にスライドさせてTSDを決めよう！',
      },
    ],
  },
  {
    id: 'gassho-tsd',
    name: '合掌積み (Gassho TSD)',
    description: '左右対称の美しい合掌の形でTSDを狙う開幕テンプレ。Tミノを差し込んで実際に消去します。',
    seed: 306,
    initialBoard: fillCells(createEmptyBoard(), [
      { x: 0, y: 19, type: 'S' }, { x: 1, y: 19, type: 'S' }, { x: 2, y: 19, type: 'O' }, { x: 3, y: 19, type: 'O' },
      { x: 1, y: 18, type: 'S' }, { x: 2, y: 18, type: 'O' }, { x: 3, y: 18, type: 'O' },
      // Right side
      { x: 7, y: 19, type: 'I' }, { x: 8, y: 19, type: 'I' }, { x: 9, y: 19, type: 'I' },
      { x: 8, y: 18, type: 'I' }, { x: 9, y: 18, type: 'I' },
      // Overhang
      { x: 5, y: 17, type: 'Z' }, { x: 6, y: 17, type: 'Z' },
      { x: 6, y: 18, type: 'Z' }, { x: 7, y: 18, type: 'Z' },
    ]),
    steps: [
      {
        minoType: 'T',
        // TSD under Z-overhang.
        // Center at x=4, y=18 => position {x:3, y:17}
        position: { x: 3, y: 17 },
        rotation: 2,
        description: 'Tミノを逆さま（回転2）にして、屋根の下にスライドさせてT-Spin Doubleを決めよう！',
      },
    ],
  },
  {
    id: 'bt-cannon',
    name: 'BT砲 (BT Cannon)',
    description: 'TSTの後にTSDを撃ち込む大火力テンプレ。実際にTSTを決めた後、TSDを決めてライン消去する連続練習です。',
    seed: 307,
    initialBoard: fillCells(createEmptyBoard(), [
      // Base stack (TST slot left, TSD slot right)
      { x: 0, y: 19, type: 'L' }, { x: 1, y: 19, type: 'L' }, { x: 2, y: 19, type: 'L' },
      { x: 0, y: 18, type: 'L' },
      // Right side stack
      { x: 4, y: 19, type: 'I' }, { x: 5, y: 19, type: 'I' }, { x: 6, y: 19, type: 'I' }, { x: 7, y: 19, type: 'I' }, { x: 8, y: 19, type: 'I' }, { x: 9, y: 19, type: 'I' },
      { x: 5, y: 18, type: 'O' }, { x: 6, y: 18, type: 'O' }, { x: 7, y: 18, type: 'Z' }, { x: 8, y: 18, type: 'Z' }, { x: 9, y: 18, type: 'Z' },
      { x: 5, y: 17, type: 'O' }, { x: 6, y: 17, type: 'O' }, { x: 8, y: 17, type: 'Z' },
      // Overhang roof at x=3 for TST
      { x: 3, y: 15, type: 'J' }, { x: 3, y: 16, type: 'J' }, { x: 2, y: 16, type: 'J' },
    ]),
    steps: [
      {
        minoType: 'T',
        // TST slot at x=1.
        // Center at x=2, y=17. position {x:1, y:16}
        position: { x: 1, y: 16 },
        rotation: 3,
        description: '最初のTミノを左回転（回転3）させて、左側のTST穴に回転ねじ込み（T-Spin Triple）を決めよう！',
      },
      {
        minoType: 'T',
        // TSD slot at x=3 (shifted after 3 lines clear of TST).
        // 3 lines clear of TST shifts the target up/down.
        // Original TSD slot at x=3, center y=18 => position {x:2, y:17}.
        // TST cleared 3 lines, so the slot shifted down by 3 lines.
        // Target y: 17 + 3 = 20 (since bottom height limit is 20, actually if 3 lines cleared, bottom is shifted).
        // Let's specify the correct coordinate after TST clear: y=17.
        position: { x: 2, y: 17 },
        rotation: 2,
        description: '次のTミノを回転2にして、中央の隙間に滑り込ませてT-Spin Doubleを決めよう！',
      },
    ],
  },
  {
    id: 'td-cannon',
    name: 'TD砲 (TD Cannon)',
    description: 'TSTからTSDへと繋ぐ連続攻撃テンプレ。実際にTSTを決めてライン消去するステップを練習します。',
    seed: 308,
    initialBoard: fillCells(createEmptyBoard(), [
      // Left side stack
      { x: 0, y: 19, type: 'J' }, { x: 1, y: 19, type: 'J' }, { x: 2, y: 19, type: 'J' },
      { x: 0, y: 18, type: 'J' },
      // Right side stack creating the TST slot on the left
      { x: 4, y: 19, type: 'O' }, { x: 5, y: 19, type: 'O' }, { x: 6, y: 19, type: 'I' }, { x: 7, y: 19, type: 'I' }, { x: 8, y: 19, type: 'I' }, { x: 9, y: 19, type: 'I' },
      { x: 4, y: 18, type: 'O' }, { x: 5, y: 18, type: 'O' }, { x: 6, y: 18, type: 'I' }, { x: 7, y: 18, type: 'I' }, { x: 8, y: 18, type: 'I' }, { x: 9, y: 18, type: 'I' },
      // Overhang
      { x: 3, y: 16, type: 'L' }, { x: 3, y: 17, type: 'L' }, { x: 4, y: 17, type: 'L' }, { x: 5, y: 17, type: 'L' },
    ]),
    steps: [
      {
        minoType: 'T',
        // TST slot on the left (x=1,2,3 under L-overhang).
        // Center at x=2, y=17 => position {x:1, y:16}
        position: { x: 1, y: 16 },
        rotation: 1,
        description: 'Tミノを右回転（回転1）させて、Lミノの屋根の下に回転入れしてT-Spin Tripleを決めよう！',
      },
    ],
  },
  {
    id: 'imperial-cross',
    name: 'インペリアルクロス (Imperial Cross)',
    description: '十字型の溝を利用してTSDを2回連続で決める定石。連続TSDで実際にラインを消去します。',
    seed: 309,
    initialBoard: fillCells(createEmptyBoard(), [
      // Left side stack
      { x: 0, y: 19, type: 'I' }, { x: 1, y: 19, type: 'I' }, { x: 2, y: 19, type: 'I' },
      { x: 0, y: 18, type: 'I' }, { x: 1, y: 18, type: 'I' },
      { x: 0, y: 17, type: 'I' }, { x: 1, y: 17, type: 'I' },
      // Right side stack (forming the cross slot)
      { x: 5, y: 19, type: 'O' }, { x: 6, y: 19, type: 'O' }, { x: 7, y: 19, type: 'J' }, { x: 8, y: 19, type: 'J' }, { x: 9, y: 19, type: 'J' },
      { x: 5, y: 18, type: 'O' }, { x: 6, y: 18, type: 'O' }, { x: 7, y: 18, type: 'J' },
      { x: 6, y: 17, type: 'O' }, { x: 7, y: 17, type: 'O' },
      // Overhang creating the top of the cross
      { x: 3, y: 16, type: 'L' }, { x: 4, y: 16, type: 'L' },
    ]),
    steps: [
      {
        minoType: 'T',
        // 1st TSD in the cross slot.
        // Center at x=3, y=18 => position {x:2, y:17}
        position: { x: 2, y: 17 },
        rotation: 1,
        description: 'Tミノを回転させて十字の溝に押し込み、1回目のT-Spin Doubleを決めよう！',
      },
      {
        minoType: 'T',
        // 2nd TSD in the remaining slot.
        // After 2 lines clear, the cross slot shifts.
        // Second TSD target center y shifts down by 2. position y becomes 17.
        position: { x: 2, y: 17 },
        rotation: 3,
        description: 'もう一つのTミノを反対回転（回転3）で押し込んで、2回目のT-Spin Doubleを完成させよう！',
      },
    ],
  },
  {
    id: 'c-spin',
    name: 'C-Spin',
    description: 'TSTを決めるための代表的な定石。Tミノを滑り込ませて実際に3段消去する練習をします。',
    seed: 310,
    initialBoard: fillCells(createEmptyBoard(), [
      // Left side stack
      { x: 0, y: 19, type: 'J' }, { x: 1, y: 19, type: 'J' }, { x: 2, y: 19, type: 'J' },
      { x: 0, y: 18, type: 'J' },
      // Right side stack creating the vertical TST slot
      { x: 4, y: 19, type: 'O' }, { x: 5, y: 19, type: 'O' }, { x: 6, y: 19, type: 'I' }, { x: 7, y: 19, type: 'I' }, { x: 8, y: 19, type: 'I' }, { x: 9, y: 19, type: 'I' },
      { x: 4, y: 18, type: 'O' }, { x: 5, y: 18, type: 'O' }, { x: 6, y: 18, type: 'I' }, { x: 7, y: 18, type: 'I' }, { x: 8, y: 18, type: 'I' }, { x: 9, y: 18, type: 'I' },
      // Overhang at x=3
      { x: 3, y: 17, type: 'L' }, { x: 4, y: 17, type: 'L' },
    ]),
    steps: [
      {
        minoType: 'T',
        // TST slot. Pointing left (rotation 3).
        // Center at x=2, y=18 => position {x:1, y:17}
        position: { x: 1, y: 17 },
        rotation: 3,
        description: 'Tミノを回転させて、Lミノの屋根の下にある縦の隙間に滑り込ませてT-Spin Tripleを決めよう！',
      },
    ],
  },
];
