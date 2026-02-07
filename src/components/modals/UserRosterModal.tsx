import { useMemo, useEffect, useState, useRef } from 'react';
import useSWR from 'swr';
import { fetcher, createKey } from '../../lib/swr';
import { SupabaseService } from '../../services/supabaseService';
import RosterPicksDisplay from '../roster/RosterPicksDisplay';
import BaseModal from './BaseModal';
import type { RosterPick, RosterSlot } from '../../models';

interface UserRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  leagueId: string | null;
  seasonId?: string | null;
  username: string;
}

export default function UserRosterModal({ 
  isOpen, 
  onClose, 
  userId, 
  leagueId, 
  seasonId,
  username 
}: UserRosterModalProps) {
  // Fetch roster data for the user
  const rosterKey = createKey('roster', userId, leagueId);
  const { data: picks = [], isLoading: isLoadingRoster } = useSWR<RosterPick[]>(
    isOpen && userId && leagueId ? rosterKey : null,
    fetcher
  );

  const latestEliminationWeekKey = createKey('latest-elimination-week', seasonId);
  const { data: latestEliminationWeek = 0 } = useSWR<number>(
    isOpen && seasonId ? latestEliminationWeekKey : null,
    fetcher
  );
  const nextBootWeek = Math.max(latestEliminationWeek + 1, 1);

  // Fetch points for each pick
  const [pickPointsMap, setPickPointsMap] = useState<Record<string, number>>({});
  const prevPicksRef = useRef<string>('');
  
  useEffect(() => {
    if (!isOpen || !userId || !leagueId || !picks || picks.length === 0) {
      if (Object.keys(pickPointsMap).length > 0) {
        setPickPointsMap({});
      }
      prevPicksRef.current = '';
      return;
    }

    // Create a stable string representation of picks to detect changes
    const picksKey = picks.map(p => `${p.id}:${p.contestant?.id || ''}`).sort().join('|');
    
    // Only fetch if picks actually changed
    if (prevPicksRef.current === picksKey) {
      return;
    }

    prevPicksRef.current = picksKey;

    const fetchPickPoints = async () => {
      const pointsMap: Record<string, number> = {};

      await Promise.all(
        picks.map(async (pick) => {
          if (pick.contestant) {
            const points = await SupabaseService.calculatePickPoints(
              userId,
              leagueId,
              pick.contestant.id,
              pick.pickType
            );
            pointsMap[pick.id] = points;
          }
        })
      );

      setPickPointsMap(pointsMap);
    };

    fetchPickPoints();
  }, [userId, leagueId, picks, isOpen]); // Added isOpen to dependencies

  // Transform picks into roster slots (same logic as RosterPage)
  const roster = useMemo<RosterSlot[]>(() => {
    const rosterSlots: RosterSlot[] = [
      { type: 'final3', contestant: null, points: 0 },
      { type: 'final3', contestant: null, points: 0 },
      { type: 'final3', contestant: null, points: 0 },
      { type: 'boot', contestant: null, points: 0 },
    ];

    if (picks && picks.length > 0) {
      const final3Picks = picks.filter(p => p.pickType === 'final3');
      const bootPicks = picks.filter(p => p.pickType === 'boot');
      
      final3Picks.forEach((pick, index) => {
        if (index < 3 && pick.contestant) {
          rosterSlots[index].contestant = pick.contestant;
          rosterSlots[index].points = pickPointsMap[pick.id] || 0;
          rosterSlots[index].pickId = pick.id;
        }
      });
      
      if (bootPicks.length > 0 && bootPicks[0].contestant) {
        rosterSlots[3].contestant = bootPicks[0].contestant;
        rosterSlots[3].points = pickPointsMap[bootPicks[0].id] || 0;
        rosterSlots[3].pickId = bootPicks[0].id;
        rosterSlots[3].weekNumber = bootPicks[0].weekNumber;
      }
    }

    return rosterSlots;
  }, [picks, pickPointsMap]);

  const final3Slots = roster.filter(slot => slot.type === 'final3');
  const bootSlot = roster.find(slot => slot.type === 'boot');
  const currentBootWeek = bootSlot?.weekNumber ?? 0;
  const isCurrentBootPickActive = Boolean(bootSlot?.contestant && bootSlot?.weekNumber === nextBootWeek);
  const canDraftBoot = currentBootWeek < nextBootWeek;

  const isFinal3ContestantEliminated = (contestant: any) => {
    if (!contestant) return false;
    return contestant.status === 'eliminated' || contestant.status === 'jury';
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${username}'s Roster`}
      sizeClassName="lg:w-[600px]"
      bodyClassName="flex-1 overflow-y-auto p-4 lg:p-6"
    >
            {isLoadingRoster ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading roster...</div>
              </div>
            ) : (
              <RosterPicksDisplay
                final3Slots={final3Slots}
                bootSlot={bootSlot}
                nextBootWeek={nextBootWeek}
                latestEliminationWeek={latestEliminationWeek}
                isCurrentBootPickActive={isCurrentBootPickActive}
                canDraftBoot={canDraftBoot}
                headingLevel="h3"
                isFinal3ContestantEliminated={isFinal3ContestantEliminated}
              />
            )}
    </BaseModal>
  );
}

