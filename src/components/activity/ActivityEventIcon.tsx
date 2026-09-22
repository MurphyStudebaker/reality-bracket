import {
  Flame,
  Trophy,
  Shield,
  Gem,
  Star,
  Users,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';
import { getActivityIconTypeClass } from '../../lib/activityEventIconType';

function iconForActivityType(activityType: string): LucideIcon {
  switch (activityType) {
    case 'eliminated':
      return Flame;
    case 'medical_evacuated':
      return HeartPulse;
    case 'tribal_immunity':
    case 'immunity':
      return Shield;
    case 'individual_immunity':
      return Trophy;
    case 'found_immunity_idol':
      return Gem;
    case 'made_merge':
      return Users;
    case 'made_jury':
    case 'made_final_three':
    case 'finished_first':
    case 'finished_second':
    case 'finished_third':
      return Star;
    default:
      return Trophy;
  }
}

interface ActivityEventIconProps {
  activityType: string;
  /** When false, icon keeps event-type colors but is dimmed (roster rows with no points). */
  active?: boolean;
  size?: 'sm' | 'md';
}

export default function ActivityEventIcon({
  activityType,
  active = true,
  size = 'md',
}: ActivityEventIconProps) {
  const Icon = iconForActivityType(activityType);
  const sizeClass = size === 'sm' ? 'activity-icon--sm' : 'activity-icon--md';
  const typeClass = getActivityIconTypeClass(activityType);
  const dimClass = active ? '' : 'activity-icon--dimmed';

  return (
    <div className={`activity-icon ${sizeClass} ${typeClass} ${dimClass}`.trim()}>
      <Icon strokeWidth={2} />
    </div>
  );
}
