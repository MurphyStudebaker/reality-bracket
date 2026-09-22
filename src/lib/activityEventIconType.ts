export type ActivityIconTypeClass =
  | 'activity-icon--type-elimination'
  | 'activity-icon--type-tribal-immunity'
  | 'activity-icon--type-individual-immunity'
  | 'activity-icon--type-idol'
  | 'activity-icon--type-milestone';

export function getActivityIconTypeClass(activityType: string): ActivityIconTypeClass {
  switch (activityType) {
    case 'eliminated':
    case 'medical_evacuated':
      return 'activity-icon--type-elimination';
    case 'tribal_immunity':
    case 'immunity':
      return 'activity-icon--type-tribal-immunity';
    case 'individual_immunity':
      return 'activity-icon--type-individual-immunity';
    case 'found_immunity_idol':
      return 'activity-icon--type-idol';
    case 'made_merge':
    case 'made_jury':
    case 'made_final_three':
    case 'finished_first':
    case 'finished_second':
    case 'finished_third':
      return 'activity-icon--type-milestone';
    default:
      return 'activity-icon--type-individual-immunity';
  }
}
