import React from 'react';
import BaseModal from './BaseModal';
import RosterActivityContent from '../roster/RosterActivityContent';
import type { RosterSlot, RosterPickWithContestant } from '../../models';

interface RosterActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterSlot[];
  picks: RosterPickWithContestant[];
  seasonId: string | null;
  userId: string | null;
  leagueId: string | null;
}

export default function RosterActivityModal({
  isOpen,
  onClose,
  roster,
  picks,
  seasonId,
  userId,
  leagueId,
}: RosterActivityModalProps) {
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Roster Activity"
    >
      <RosterActivityContent
        roster={roster}
        picks={picks}
        seasonId={seasonId}
        userId={userId}
        leagueId={leagueId}
      />
    </BaseModal>
  );
}

