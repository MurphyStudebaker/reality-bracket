/**
 * Client-side scoring rules for activity events.
 * Must stay aligned with Postgres RPCs:
 * - calculate_pick_points
 * - calculate_user_total_points
 * See: src/services/migrations/update_immunity_scoring_functions.sql
 */

export interface ActivityEventScoringInput {
  weekNumber: number;
  activityType: string;
}

/** Fields needed from roster_picks / UI roster slot to score one event */
export interface RosterPickScoringInput {
  pickType: 'final3' | 'boot';
  weekNumber?: number;
  activeFromWeek?: number;
  activeThroughWeek?: number;
}

/**
 * Points for a single activity_event row joined to one roster pick,
 * matching the CASE expression in calculate_user_total_points / calculate_pick_points.
 */
export function scoreActivityEventForPick(
  event: ActivityEventScoringInput,
  pick: RosterPickScoringInput
): number {
  const w = event.weekNumber;
  const t = event.activityType;

  if (pick.pickType === 'boot') {
    if (
      (t === 'eliminated' || t === 'medical_evacuated') &&
      pick.weekNumber != null &&
      pick.weekNumber === w
    ) {
      return 15;
    }
    return 0;
  }

  if (pick.pickType === 'final3') {
    if (pick.activeFromWeek == null) {
      return 0;
    }
    if (w < pick.activeFromWeek) {
      return 0;
    }
    if (pick.activeThroughWeek != null && w > pick.activeThroughWeek) {
      return 0;
    }

    if (t === 'tribal_immunity') {
      return 5;
    }
    if (
      t === 'individual_immunity' ||
      t === 'found_immunity_idol' ||
      t === 'immunity'
    ) {
      return 10;
    }
    if (t === 'made_jury' || t === 'made_final_three') {
      return 5;
    }
    return 0;
  }

  return 0;
}
