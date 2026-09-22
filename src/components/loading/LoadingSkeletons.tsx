import { Skeleton } from '../ui/skeleton';

function LoadingStatus({ label }: { label: string }) {
  return <span className="sr-only">{label}</span>;
}

export function HomeLeagueCardSkeleton() {
  return (
    <div
      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 lg:p-5"
      aria-hidden
    >
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-6 w-40 max-w-[200px]" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function HomeLeaguesListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 flex flex-col gap-4 py-4" role="status" aria-busy="true">
      <LoadingStatus label="Loading your leagues" />
      {Array.from({ length: count }).map((_, i) => (
        <HomeLeagueCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LeagueHeaderSkeleton({ showActivityButton = false }: { showActivityButton?: boolean }) {
  return (
    <div className="mb-6" aria-hidden>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-56 max-w-[70vw]" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
        {showActivityButton ? <Skeleton className="h-9 w-9 rounded-lg" /> : null}
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="hidden sm:block h-4 w-40" />
      </div>
    </div>
  );
}

export function RosterPickRowSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-4 min-h-[96px]">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg hidden sm:block" />
      </div>
    </div>
  );
}

export function RosterPicksDisplaySkeleton() {
  return (
    <div className="mb-8" aria-hidden>
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="space-y-4">
        <RosterPickRowSkeleton />
        <RosterPickRowSkeleton />
        <RosterPickRowSkeleton />
        <RosterPickRowSkeleton />
      </div>
    </div>
  );
}

export function HowPointsSectionSkeleton() {
  return (
    <div className="mt-12" aria-hidden>
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-slate-700 p-6 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function RosterPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8" role="status" aria-busy="true">
      <LoadingStatus label="Loading roster" />
      <LeagueHeaderSkeleton showActivityButton />
      <Skeleton className="h-[88px] w-full rounded-xl mb-6" />
      <RosterPicksDisplaySkeleton />
      <HowPointsSectionSkeleton />
    </div>
  );
}

export function LeaguePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8" role="status" aria-busy="true">
      <LoadingStatus label="Loading league" />
      <LeagueHeaderSkeleton showActivityButton />
      <Skeleton className="h-[88px] w-full rounded-xl mb-6" />
      <Skeleton className="h-8 w-24 mb-6" />
      <PodiumSkeleton />
      <div className="mt-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <StandingsTableSkeleton />
      </div>
    </div>
  );
}

export function PodiumSkeleton() {
  return (
    <div
      className="flex items-end justify-center gap-2 sm:gap-4 mb-8"
      aria-hidden
    >
      {(
        [
          ['max-w-[140px] sm:max-w-[200px]', 'h-20 sm:h-24'],
          ['max-w-[140px] sm:max-w-[200px]', 'h-28 sm:h-32'],
          ['max-w-[140px] sm:max-w-[200px]', 'h-16 sm:h-20'],
        ] as const
      ).map(([widthClass, pedestalClass], index) => (
        <div key={index} className={`flex-1 ${widthClass}`}>
          <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-3 border border-slate-700">
            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded mx-auto mb-2 sm:mb-3" />
            <Skeleton className="aspect-square rounded-full w-full mb-2 sm:mb-3" />
            <Skeleton className="h-3 w-16 mx-auto mb-1" />
            <Skeleton className="h-4 w-10 mx-auto" />
          </div>
          <Skeleton className={`w-full rounded-t-lg ${pedestalClass}`} />
        </div>
      ))}
    </div>
  );
}

export function StandingsTableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[40px_1fr_80px_50px] sm:grid-cols-[60px_1fr_100px_80px] gap-2 sm:gap-4 p-4 border-b border-slate-800 last:border-b-0 items-center"
          aria-hidden
        >
          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <Skeleton className="h-4 w-28 max-w-full" />
          </div>
          <Skeleton className="h-4 w-10 ml-auto" />
          <Skeleton className="h-4 w-6 mx-auto" />
        </div>
      ))}
    </>
  );
}

export function StandingsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
      role="status"
      aria-busy="true"
    >
      <LoadingStatus label="Loading standings" />
      <div className="grid grid-cols-[40px_1fr_80px_50px] sm:grid-cols-[60px_1fr_100px_80px] gap-2 sm:gap-4 p-4 border-b border-slate-800">
        <Skeleton className="h-4 w-8 mx-auto" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12 ml-auto" />
        <Skeleton className="h-4 w-10 mx-auto" />
      </div>
      <div>
        <StandingsTableRowsSkeleton rows={rows} />
      </div>
    </div>
  );
}

function RosterActivityRowSkeleton() {
  return (
    <div
      className="activity-roster-row activity-roster-row--muted border border-slate-700/80 min-h-[72px] sm:min-h-[80px]"
      aria-hidden
    >
      <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-36 max-w-full" />
      </div>
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
    </div>
  );
}

function RosterActivityWeekBlockSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-3">
        <RosterActivityRowSkeleton />
        <RosterActivityRowSkeleton />
        <RosterActivityRowSkeleton />
      </div>
    </div>
  );
}

/** Week-grouped activity rows (matches redesigned roster activity list). */
export function RosterActivityListSkeleton() {
  return (
    <div className="w-full space-y-8" role="status" aria-busy="true">
      <LoadingStatus label="Loading activity" />
      <RosterActivityWeekBlockSkeleton />
    </div>
  );
}

/** Full roster weekly activity block including page header. */
export function RosterWeeklyActivitySkeleton() {
  return (
    <div className="w-full" role="status" aria-busy="true">
      <LoadingStatus label="Loading activity" />
      <div className="flex items-center justify-between gap-3 mb-6" aria-hidden>
        <Skeleton className="h-8 w-52 max-w-[70%]" />
        <Skeleton className="h-8 w-28 rounded-full shrink-0" />
      </div>
      <RosterActivityWeekBlockSkeleton />
    </div>
  );
}

/** @deprecated Use RosterActivityListSkeleton or RosterWeeklyActivitySkeleton */
export function ActivityFeedSkeleton() {
  return <RosterActivityListSkeleton />;
}

function LeagueActivityEventCardSkeleton() {
  return (
    <div className="activity-league-event-card" aria-hidden>
      <div className="activity-league-event-body">
        <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-40 max-w-full" />
        </div>
      </div>
      <div className="activity-league-event-footer space-y-2">
        <Skeleton className="h-3 w-28" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function LeagueActivityFeedSkeleton() {
  return (
    <div className="w-full space-y-8" role="status" aria-busy="true">
      <LoadingStatus label="Loading league activity" />
      <div>
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="space-y-4">
          <LeagueActivityEventCardSkeleton />
          <LeagueActivityEventCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function DraftOrderMembersSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2" role="status" aria-busy="true">
      <LoadingStatus label="Loading league members" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3"
          aria-hidden
        >
          <Skeleton className="h-5 w-5 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileLeagueRowSkeleton() {
  return (
    <div className="rounded-xl p-5 py-2" aria-hidden>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

export function ProfileLeaguesListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2" role="status" aria-busy="true">
      <LoadingStatus label="Loading leagues" />
      {Array.from({ length: count }).map((_, i) => (
        <ProfileLeagueRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function SeasonSelectFieldSkeleton() {
  return (
    <Skeleton className="h-[50px] w-full rounded-lg" aria-hidden />
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="space-y-5 py-4" role="status" aria-busy="true">
      <LoadingStatus label="Loading account" />
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}
