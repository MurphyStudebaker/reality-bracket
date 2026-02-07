import React from 'react';
import { UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Contestant, RosterSlot } from '../../models';

interface RosterPicksDisplayProps {
  final3Slots: RosterSlot[];
  bootSlot?: RosterSlot;
  nextBootWeek: number;
  latestEliminationWeek: number;
  isCurrentBootPickActive: boolean;
  canDraftBoot: boolean;
  hasDraftStarted?: boolean;
  currentDraftTurnName?: string | null;
  isUserTurnForPosition?: (position: 1 | 2 | 3) => boolean;
  onDraftFinal3?: (index: number) => void;
  onDraftBoot?: () => void;
  headingLevel?: 'h2' | 'h3';
  isFinal3ContestantEliminated: (contestant: Contestant | null) => boolean;
}

export default function RosterPicksDisplay({
  final3Slots,
  bootSlot,
  nextBootWeek,
  latestEliminationWeek,
  isCurrentBootPickActive,
  canDraftBoot,
  hasDraftStarted = false,
  currentDraftTurnName,
  isUserTurnForPosition,
  onDraftFinal3,
  onDraftBoot,
  headingLevel = 'h2',
  isFinal3ContestantEliminated,
}: RosterPicksDisplayProps) {
  const HeadingTag = headingLevel;
  const canDraftFinal3 = (position: 1 | 2 | 3) =>
    hasDraftStarted && Boolean(isUserTurnForPosition?.(position));
  const showFinal3DraftButton = Boolean(onDraftFinal3);
  const showBootDraftButton = Boolean(onDraftBoot);
  const final3Labels = ['Sole Survivor', 'Runner Up', 'Third Place'] as const;

  return (
    <>
      {/* Final 3 Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <HeadingTag className="text-2xl">Final 3 Picks</HeadingTag>
        </div>
        
        <div className="space-y-4">
          {final3Slots.map((slot, index) => {
            const isEliminated = isFinal3ContestantEliminated(slot.contestant);
            const borderColor = slot.contestant
              ? (isEliminated ? '#6B7280' : '#BFFF0B')
              : '#94A3B8';
            const position = (index + 1) as 1 | 2 | 3;
            
            return (
              <div
                key={index}
                className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 p-4 min-h-[96px] relative overflow-hidden transition-all ${
                  isEliminated ? 'opacity-60 grayscale' : ''
                }`}
                style={{ borderColor }}
              >
                {slot.contestant ? (
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Side: Image, Name, Occupation */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar
                        className={`w-16 h-16 border-2 flex-shrink-0 ${
                          isEliminated ? 'border-slate-500 grayscale' : 'border-[#BFFF0B]'
                        }`}
                      >
                        <AvatarImage
                          src={slot.contestant.imageUrl}
                          alt={slot.contestant.name}
                          className={`object-cover ${isEliminated ? 'grayscale' : ''}`}
                        />
                        <AvatarFallback>
                          {slot.contestant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold ${isEliminated ? 'text-slate-500' : 'text-white'}`}>
                          {slot.contestant.name}
                        </h3>
                        <p className={`text-sm ${isEliminated ? 'text-slate-600' : 'text-slate-400'}`}>
                          {slot.contestant.occupation || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Status and Points */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      {/* Status Badge */}
                      <div>
                        {isEliminated ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-red-600 text-white font-semibold">
                            Eliminated
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs bg-green-600 text-white font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      
                      {/* Points */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${isEliminated ? 'text-slate-600' : 'text-[#BFFF0B]'}`}>
                          {slot.points ?? 0}
                        </div>
                        <div className="text-xs text-slate-500">points</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-slate-700 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-8 h-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-400">
                          {final3Labels[index] || `Empty Slot ${index + 1}`}
                        </h3>
                        <p className="text-sm text-slate-500">No contestant selected</p>
                      </div>
                    </div>
                    {showFinal3DraftButton && (
                      <button
                        onClick={() => onDraftFinal3?.(index)}
                        disabled={!canDraftFinal3(position)}
                        className={`px-6 py-2.5 rounded-lg border-2 transition-all flex-shrink-0 ${
                          canDraftFinal3(position)
                            ? 'hover:bg-slate-800 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        style={{ borderColor: '#BFFF0B', color: '#BFFF0B' }}
                        title={
                          !hasDraftStarted
                            ? 'Draft has not started yet'
                            : !canDraftFinal3(position)
                            ? `It's ${currentDraftTurnName || 'another player'}'s turn to draft for Position ${index + 1}`
                            : 'Draft Player'
                        }
                      >
                        Draft Player
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Boot Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div>
            <HeadingTag className="text-2xl">Next Eliminated Pick</HeadingTag>
            <p className="text-xs text-slate-500 mt-0.5">
              {isCurrentBootPickActive
                ? `Locked in for Week ${nextBootWeek}.`
                : latestEliminationWeek === 0
                  ? `Week ${nextBootWeek} pick is available now.`
                  : `Next Eliminated pick for Week ${nextBootWeek} unlocks after Week ${latestEliminationWeek} elimination.`}
            </p>
          </div>
        </div>

        <div
          className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border-2 border-red-500 p-4 relative overflow-hidden ${
            isCurrentBootPickActive ? '' : 'border-dashed border-red-500/60'
          }`}
        >
          {isCurrentBootPickActive && bootSlot?.contestant ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-16 h-16 border-2 border-red-500 flex-shrink-0">
                  <AvatarImage
                    src={bootSlot.contestant.imageUrl}
                    alt={bootSlot.contestant.name}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {bootSlot.contestant.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-wide text-red-400 mb-1">Week {nextBootWeek}</div>
                  <h3 className="text-lg font-semibold text-white">{bootSlot.contestant.name}</h3>
                  <p className="text-sm text-slate-400">
                    {bootSlot.contestant.occupation || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs bg-red-500 text-white font-semibold">
                    BOOT
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#BFFF0B]">
                    {bootSlot.points ?? 0}
                  </div>
                  <div className="text-xs text-slate-500">points</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 border-2 border-dashed border-red-500/50 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-8 h-8 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-400">
                    Who will get their torch snuffed next?
                  </h3>
                  <p className="text-sm text-slate-500">
                    {canDraftBoot
                      ? `Select a contestant for Week ${nextBootWeek} before the elimination airs. Last week you picked ${bootSlot?.contestant?.name || 'No one'}.`
                      : `Waiting for Week ${latestEliminationWeek || 1} elimination to unlock Week ${nextBootWeek}.`}
                  </p>
                </div>
              </div>
              {showBootDraftButton && (
                <>
                  <button
                    onClick={() => {
                      if (!canDraftBoot) return;
                      onDraftBoot?.();
                    }}
                    disabled={!canDraftBoot}
                    className={`px-6 py-2.5 rounded-lg border-2 transition-all flex-shrink-0 font-semibold ${
                      canDraftBoot
                        ? 'border-[#BFFF0B] text-[#BFFF0B] hover:bg-slate-800 cursor-pointer'
                        : 'border-red-600 text-red-400 opacity-60 cursor-not-allowed'
                    }`}
                    title={
                      canDraftBoot
                        ? `Draft a contestant for Week ${nextBootWeek}`
                        : `Next Boot pick unlocks after Week ${latestEliminationWeek || 1}`
                    }
                  >
                    Draft Player
                  </button>
                  {!canDraftBoot && (
                    <p className="text-xs text-slate-500">
                      Once the next elimination is recorded you can choose a Week {nextBootWeek} boot pick.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

