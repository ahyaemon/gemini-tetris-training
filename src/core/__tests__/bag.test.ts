import { describe, it, expect } from 'vitest';
import { getInitialBagState, pullNextMino, createRandom, generateBag } from '../bag';
import type { MinoType } from '../types';

describe('Tetris Bag Generator (Mulberry32 & 7-Bag)', () => {
  it('should generate same sequence for same seed', () => {
    const seed = 12345;
    const state1 = getInitialBagState(seed);
    const state2 = getInitialBagState(seed);

    expect(state1.nextQueue).toEqual(state2.nextQueue);
    expect(state1.bagPool).toEqual(state2.bagPool);

    // Pull 20 minos and ensure they match
    let current1 = state1;
    let current2 = state2;
    for (let i = 0; i < 20; i++) {
      const pull1 = pullNextMino(current1);
      const pull2 = pullNextMino(current2);
      expect(pull1.mino).toBe(pull2.mino);
      current1 = pull1.state;
      current2 = pull2.state;
    }
  });

  it('should generate different sequence for different seed', () => {
    const state1 = getInitialBagState(1111);
    const state2 = getInitialBagState(2222);

    // It is possible but highly unlikely that the first 10 queue is identical.
    expect(state1.nextQueue).not.toEqual(state2.nextQueue);
  });

  it('should generate 7-bag (each type exactly once in 7 pieces)', () => {
    const seed = 999;
    const rand = createRandom(seed);
    
    // Check multiple bags
    for (let b = 0; b < 5; b++) {
      const bag = generateBag(rand);
      expect(bag.length).toBe(7);
      
      const counts: Record<MinoType, number> = {
        I: 0, O: 0, T: 0, S: 0, Z: 0, J: 0, L: 0
      };
      for (const m of bag) {
        counts[m]++;
      }
      
      const expectedTypes: MinoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      for (const type of expectedTypes) {
        expect(counts[type]).toBe(1);
      }
    }
  });
});
