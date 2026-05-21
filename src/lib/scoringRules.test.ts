import { describe, it, expect } from 'vitest';
import { scoreActivityEventForPick } from './scoringRules';

describe('scoreActivityEventForPick', () => {
  const ev = (weekNumber: number, activityType: string) => ({ weekNumber, activityType });

  describe('boot picks', () => {
    it('scores 15 when elimination week matches boot week_number', () => {
      expect(scoreActivityEventForPick(ev(3, 'eliminated'), { pickType: 'boot', weekNumber: 3 })).toBe(
        15
      );
      expect(
        scoreActivityEventForPick(ev(3, 'medical_evacuated'), { pickType: 'boot', weekNumber: 3 })
      ).toBe(15);
    });

    it('scores 0 when boot week does not match event week', () => {
      expect(scoreActivityEventForPick(ev(4, 'eliminated'), { pickType: 'boot', weekNumber: 3 })).toBe(
        0
      );
    });

    it('scores 0 when boot week_number is missing', () => {
      expect(scoreActivityEventForPick(ev(3, 'eliminated'), { pickType: 'boot' })).toBe(0);
    });

    it('scores 0 for non-boot activity types', () => {
      expect(scoreActivityEventForPick(ev(3, 'tribal_immunity'), { pickType: 'boot', weekNumber: 3 })).toBe(
        0
      );
    });
  });

  describe('final3 picks', () => {
    const windowPick = {
      pickType: 'final3' as const,
      activeFromWeek: 2,
      activeThroughWeek: 10,
    };

    it('scores 0 when activeFromWeek is undefined (matches RPC IS NOT NULL gate)', () => {
      expect(
        scoreActivityEventForPick(ev(5, 'tribal_immunity'), {
          pickType: 'final3',
          activeThroughWeek: undefined,
        })
      ).toBe(0);
    });

    it('scores 0 before activeFromWeek', () => {
      expect(scoreActivityEventForPick(ev(1, 'tribal_immunity'), windowPick)).toBe(0);
    });

    it('scores 0 after activeThroughWeek', () => {
      expect(scoreActivityEventForPick(ev(11, 'tribal_immunity'), windowPick)).toBe(0);
    });

    it('scores tribal_immunity as 5 inside window', () => {
      expect(scoreActivityEventForPick(ev(5, 'tribal_immunity'), windowPick)).toBe(5);
    });

    it('scores individual immunity types as 10 inside window', () => {
      expect(scoreActivityEventForPick(ev(5, 'individual_immunity'), windowPick)).toBe(10);
      expect(scoreActivityEventForPick(ev(5, 'found_immunity_idol'), windowPick)).toBe(10);
      expect(scoreActivityEventForPick(ev(5, 'immunity'), windowPick)).toBe(10);
    });

    it('scores made_jury and made_final_three as 5 inside window', () => {
      expect(scoreActivityEventForPick(ev(8, 'made_jury'), windowPick)).toBe(5);
      expect(scoreActivityEventForPick(ev(9, 'made_final_three'), windowPick)).toBe(5);
    });

    it('allows open-ended window when activeThroughWeek is undefined', () => {
      expect(
        scoreActivityEventForPick(ev(99, 'tribal_immunity'), {
          pickType: 'final3',
          activeFromWeek: 1,
          activeThroughWeek: undefined,
        })
      ).toBe(5);
    });

    it('scores at window boundaries (inclusive)', () => {
      expect(scoreActivityEventForPick(ev(2, 'tribal_immunity'), windowPick)).toBe(5);
      expect(scoreActivityEventForPick(ev(10, 'tribal_immunity'), windowPick)).toBe(5);
    });
  });

  describe('predicted order placement (season complete)', () => {
    const activeFinal3Pick = {
      pickType: 'final3' as const,
      activeFromWeek: 1,
      activeThroughWeek: undefined,
      final3Position: 2,
      seasonCompleted: true,
    };

    it('scores 15 when contestant finishes in predicted slot', () => {
      expect(scoreActivityEventForPick(ev(13, 'finished_second'), activeFinal3Pick)).toBe(15);
      expect(
        scoreActivityEventForPick(ev(13, 'finished_first'), {
          ...activeFinal3Pick,
          final3Position: 1,
        })
      ).toBe(15);
      expect(
        scoreActivityEventForPick(ev(13, 'finished_third'), {
          ...activeFinal3Pick,
          final3Position: 3,
        })
      ).toBe(15);
    });

    it('scores 0 when finish does not match predicted slot', () => {
      expect(scoreActivityEventForPick(ev(13, 'finished_first'), activeFinal3Pick)).toBe(0);
      expect(scoreActivityEventForPick(ev(13, 'finished_third'), activeFinal3Pick)).toBe(0);
    });

    it('scores 0 when season is not completed', () => {
      expect(
        scoreActivityEventForPick(ev(13, 'finished_second'), {
          ...activeFinal3Pick,
          seasonCompleted: false,
        })
      ).toBe(0);
    });

    it('scores 0 for replaced/inactive final3 picks', () => {
      expect(
        scoreActivityEventForPick(ev(13, 'finished_second'), {
          ...activeFinal3Pick,
          activeThroughWeek: 8,
        })
      ).toBe(0);
    });
  });
});
