import React from 'react';
import BaseModal from './BaseModal';
import LeagueActivityContent from '../league/LeagueActivityContent';

interface LeagueActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string | null;
  seasonId: string | null;
}

export default function LeagueActivityModal({
  isOpen,
  onClose,
  leagueId,
  seasonId,
}: LeagueActivityModalProps) {
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="League Activity"
    >
      <LeagueActivityContent
        leagueId={leagueId}
        seasonId={seasonId}
      />
    </BaseModal>
  );
}

