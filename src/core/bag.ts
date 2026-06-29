import type { MinoType } from './types';

// Simple mulberry32 seed PRNG
export function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function() {
    let t = (a = (a + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MINO_TYPES: MinoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export function generateBag(randomFn: () => number): MinoType[] {
  const bag = [...MINO_TYPES];
  // Fisher-Yates shuffle using our seeded PRNG
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = bag[i];
    bag[i] = bag[j];
    bag[j] = temp;
  }
  return bag;
}

export interface BagState {
  nextQueue: MinoType[];
  bagPool: MinoType[];
  seed: number;
}

export function getInitialBagState(seed: number): BagState {
  const rand = createRandom(seed);
  const bag1 = generateBag(rand);
  const bag2 = generateBag(rand);
  const pool = [...bag1, ...bag2];
  
  const nextQueue = pool.slice(0, 10);
  const bagPool = pool.slice(10);
  
  // Advance seed
  const nextSeed = (rand() * 0xffffffff) >>> 0;
  
  return {
    nextQueue,
    bagPool,
    seed: nextSeed
  };
}

export function pullNextMino(state: BagState): { mino: MinoType; state: BagState } {
  const mino = state.nextQueue[0];
  const nextQueue = [...state.nextQueue.slice(1)];
  let bagPool = [...state.bagPool];
  let seed = state.seed;

  // Refill bag pool if it's running low to ensure nextQueue can be filled
  if (bagPool.length < 7) {
    const rand = createRandom(seed);
    const newBag = generateBag(rand);
    bagPool = [...bagPool, ...newBag];
    seed = (rand() * 0xffffffff) >>> 0;
  }

  // Refill nextQueue to maintain length of at least 10 (or whatever we display)
  while (nextQueue.length < 10 && bagPool.length > 0) {
    nextQueue.push(bagPool[0]);
    bagPool = bagPool.slice(1);
  }

  return {
    mino,
    state: {
      nextQueue,
      bagPool,
      seed
    }
  };
}
