import { describe, expect, it } from 'vitest';
import {
  isCompletedSeasonStatus,
  partitionLeaguesBySeasonStatus,
  sortLeaguesBySeasonStatus,
} from './leagueSeasonStatus';

describe('leagueSeasonStatus', () => {
  it('treats only completed seasons as inactive', () => {
    expect(isCompletedSeasonStatus('completed')).toBe(true);
    expect(isCompletedSeasonStatus('active')).toBe(false);
    expect(isCompletedSeasonStatus('upcoming')).toBe(false);
    expect(isCompletedSeasonStatus(undefined)).toBe(false);
  });

  it('sorts active and upcoming before completed', () => {
    const leagues = [
      { id: '1', seasonStatus: 'completed' as const },
      { id: '2', seasonStatus: 'upcoming' as const },
      { id: '3', seasonStatus: 'active' as const },
    ];

    expect(sortLeaguesBySeasonStatus(leagues).map((l) => l.id)).toEqual([
      '3',
      '2',
      '1',
    ]);
  });

  it('partitions leagues into active and archived groups', () => {
    const { activeLeagues, archivedLeagues } = partitionLeaguesBySeasonStatus([
      { id: 'a', seasonStatus: 'completed' },
      { id: 'b', seasonStatus: 'active' },
      { id: 'c', seasonStatus: 'upcoming' },
    ]);

    expect(activeLeagues.map((l) => l.id)).toEqual(['b', 'c']);
    expect(archivedLeagues.map((l) => l.id)).toEqual(['a']);
  });
});
