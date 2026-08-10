/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { buildLattice, computeSyndrome, type Pauli } from './surfaceCode';

describe('surfaceCode', () => {
  describe('computeSyndrome', () => {
    it('identifies errors using stabilizers', () => {
      const lat = buildLattice(3);
      const errors = new Array(lat.n).fill(0) as Pauli[];
      
      expect(computeSyndrome(lat, errors).size).toBe(0);

      errors[4] = 2; // Z error
      const syndrome = computeSyndrome(lat, errors);
      
      expect(syndrome.size).toBeGreaterThan(0);
      for (const id of syndrome) {
        expect(id.startsWith('X:')).toBe(true);
      }
      
      errors[4] = 1; // X error
      const syndromeX = computeSyndrome(lat, errors);
      expect(syndromeX.size).toBeGreaterThan(0);
      for (const id of syndromeX) {
        expect(id.startsWith('Z:')).toBe(true);
      }
    });
  });
});
