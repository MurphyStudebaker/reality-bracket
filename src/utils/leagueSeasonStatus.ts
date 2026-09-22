export type DbSeasonStatus = 'active' | 'completed' | 'upcoming';

export function isCompletedSeasonStatus(
  status: DbSeasonStatus | undefined
): boolean {
  return status === 'completed';
}

export function seasonStatusSortPriority(
  status: DbSeasonStatus | undefined
): number {
  switch (status) {
    case 'active':
      return 0;
    case 'upcoming':
      return 1;
    case 'completed':
      return 2;
    default:
      return 3;
  }
}

export function sortLeaguesBySeasonStatus<
  T extends { seasonStatus?: DbSeasonStatus },
>(leagues: T[]): T[] {
  return [...leagues].sort(
    (a, b) =>
      seasonStatusSortPriority(a.seasonStatus) -
      seasonStatusSortPriority(b.seasonStatus)
  );
}

export function partitionLeaguesBySeasonStatus<
  T extends { seasonStatus?: DbSeasonStatus },
>(leagues: T[]): { activeLeagues: T[]; archivedLeagues: T[] } {
  const activeLeagues: T[] = [];
  const archivedLeagues: T[] = [];

  for (const league of leagues) {
    if (isCompletedSeasonStatus(league.seasonStatus)) {
      archivedLeagues.push(league);
    } else {
      activeLeagues.push(league);
    }
  }

  return {
    activeLeagues: sortLeaguesBySeasonStatus(activeLeagues),
    archivedLeagues: sortLeaguesBySeasonStatus(archivedLeagues),
  };
}
