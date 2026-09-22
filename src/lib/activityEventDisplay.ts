const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  tribal_immunity: 'Tribal Immunity',
  individual_immunity: 'Individual Immunity',
  found_immunity_idol: 'Found Immunity Idol',
  immunity: 'Immunity',
  eliminated: 'Eliminated',
  medical_evacuated: 'Medical Evacuation',
  made_merge: 'Made Merge',
  made_final_three: 'Made Final 3',
  made_jury: 'Made Jury',
  finished_first: 'Finished as Sole Survivor',
  finished_second: 'Finished as Runner Up',
  finished_third: 'Finished in Third Place',
};

const ACTIVITY_TYPE_DISPLAY_POINTS: Record<string, number> = {
  tribal_immunity: 5,
  individual_immunity: 10,
  found_immunity_idol: 10,
  immunity: 10,
  eliminated: 15,
  medical_evacuated: 15,
  made_jury: 5,
  made_final_three: 10,
  finished_first: 15,
  finished_second: 15,
  finished_third: 15,
};

export function formatActivityType(type: string): string {
  return ACTIVITY_TYPE_LABELS[type] || type.replace(/_/g, ' ');
}

export function getActivityEventDisplayPoints(type: string): number | null {
  return ACTIVITY_TYPE_DISPLAY_POINTS[type] ?? null;
}

export function isBootCorrectPrediction(
  activityType: string,
  pickType: 'final3' | 'boot',
  weekNumber: number | undefined,
  eventWeekNumber: number
): boolean {
  return (
    pickType === 'boot' &&
    weekNumber === eventWeekNumber &&
    (activityType === 'eliminated' || activityType === 'medical_evacuated')
  );
}
