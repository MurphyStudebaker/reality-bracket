import React from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Contestant, RosterSlot } from '../../models';

interface ContestantReplacementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contestants: Contestant[];
  currentContestant: Contestant | null;
  slotType: 'final3' | 'boot';
  slotIndex: number; // Index of the slot being drafted (0-2 for final3, 3 for boot)
  onSelectContestant: (contestant: Contestant) => void;
  roster: RosterSlot[]; // Current roster to check for already selected contestants
  leagueId: string | null;
  rosterPicksByPosition: Record<number, string[]>; // Map of position (1-3) to contestant IDs already drafted for that position
}

export default function ContestantReplacementDrawer({
  isOpen,
  onClose,
  contestants,
  currentContestant,
  slotType,
  slotIndex,
  onSelectContestant,
  roster,
  leagueId,
  rosterPicksByPosition,
}: ContestantReplacementDrawerProps) {
  const [selectedContestant, setSelectedContestant] = React.useState<Contestant | null>(null);

  // Clear selected contestant when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedContestant(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Get the heading based on slot type and index
  const getHeading = () => {
    if (slotType === 'boot') {
      return 'Who Will Get Their Torch Snuffed Next?';
    }
    
    // For final3 slots, use the index to determine position
    if (slotIndex === 0) {
      return 'Who Will be the Sole Survivor?';
    } else if (slotIndex === 1) {
      return 'Who Will be the Runner Up?';
    } else if (slotIndex === 2) {
      return 'Who Will be the Third Place Finalist?';
    }
    
    // Fallback
    return 'Select a contestant';
  };

  // Get IDs of contestants already selected in other roster slots (current user's picks)
  const alreadySelectedContestantIds = roster
    .map(slot => slot.contestant?.id)
    .filter((id): id is string => id !== undefined && id !== currentContestant?.id);

  // For Final 3 positions, also get contestants already drafted for this position by other league members
  const positionDraftedContestantIds: string[] = [];
  if (slotType === 'final3' && slotIndex >= 0 && slotIndex <= 2) {
    const position = slotIndex + 1; // Convert slotIndex (0-2) to position (1-3)
    positionDraftedContestantIds.push(...(rosterPicksByPosition[position] || []));
  }

  // Combine all excluded contestant IDs (user's own picks + league-wide picks for same position)
  const excludedContestantIds = new Set([
    ...alreadySelectedContestantIds,
    ...positionDraftedContestantIds
  ]);

  // Available players are those with 'active' status AND not excluded
  const availableContestants = contestants.filter(
    c => c.status === 'active' && !excludedContestantIds.has(c.id)
  );
  
  // Unavailable players include:
  // 1. Those with 'eliminated', 'jury', or 'final3' status
  // 2. Those already selected in other roster positions (current user)
  // 3. Those already drafted for this position by other league members (for Final 3 positions)
  const unavailableContestants = contestants.filter(
    c => 
      c.status === 'eliminated' || 
      c.status === 'jury' || 
      c.status === 'final3' ||
      (c.status === 'active' && excludedContestantIds.has(c.id))
  );

  const handleSelect = (contestant: Contestant) => {
    setSelectedContestant(contestant);
  };

  const handleConfirm = () => {
    if (selectedContestant) {
      onSelectContestant(selectedContestant);
      setSelectedContestant(null);
    }
  };

  const handleCancel = () => {
    setSelectedContestant(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Mobile: Bottom Drawer, Desktop: Center Panel */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 pointer-events-none">
        <div 
          className="bg-slate-900 border-slate-800 flex flex-col max-h-[85vh] lg:max-h-[700px] w-full lg:w-[600px] rounded-t-2xl lg:rounded-2xl border-t lg:border pointer-events-auto animate-slide-in-bottom lg:animate-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl">{getHeading()}</h2>
              {currentContestant && (
                <p className="text-sm text-slate-400 mt-1">
                  Replacing {currentContestant.name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Available Contestants */}
            {availableContestants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-slate-400 mb-3">AVAILABLE CONTESTANTS</h3>
                <div className="space-y-2">
                  {availableContestants.map((contestant) => (
                    <button
                      key={contestant.id}
                      onClick={() => handleSelect(contestant)}
                      className={`w-full bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-all border-2 ${
                        selectedContestant?.id === contestant.id
                          ? 'border-[#BFFF0B]'
                          : 'border-transparent hover:border-slate-700'
                      }`}
                      style={selectedContestant?.id === contestant.id ? { backgroundColor: 'rgba(34, 197, 94, 0.15)' } : undefined}
                    >
                      <div className="flex items-center gap-4">
                        {/* Profile Image */}
                        <Avatar
                          className="w-16 h-16 border-2 border-[#BFFF0B] flex-shrink-0"
                        >
                          <AvatarImage
                            src={contestant.imageUrl}
                            alt={contestant.name}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {contestant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <p className="mb-1">{contestant.name}</p>
                          <p className="text-sm text-slate-400">
                            {contestant.age} • {contestant.occupation}
                          </p>
                          <p className="text-xs text-slate-500">{contestant.hometown}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="px-3 py-1 rounded-full text-xs flex-shrink-0"
                             style={{ backgroundColor: 'rgba(191, 255, 11, 0.2)', color: '#BFFF0B' }}>
                          Active
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Unavailable Contestants */}
            {unavailableContestants.length > 0 && (
              <div>
                <h3 className="text-sm text-slate-400 mb-3">UNAVAILABLE CONTESTANTS</h3>
                <div className="space-y-2">
                  {unavailableContestants.map((contestant) => (
                    <div
                      key={contestant.id}
                      className="w-full bg-slate-800/30 rounded-lg p-4 opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-4">
                        {/* Profile Image - Grayed Out */}
                        <Avatar
                          className="w-16 h-16 border-2 border-slate-700 flex-shrink-0 grayscale"
                        >
                          <AvatarImage
                            src={contestant.imageUrl}
                            alt={contestant.name}
                            className="grayscale object-cover"
                          />
                          <AvatarFallback className="grayscale">
                            {contestant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <p className="text-slate-500 mb-1">{contestant.name}</p>
                          <p className="text-sm text-slate-600">
                            {contestant.age} • {contestant.occupation}
                          </p>
                          <p className="text-xs text-slate-700">{contestant.hometown}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="px-3 py-1 rounded-full text-xs bg-slate-700 text-slate-500 flex-shrink-0">
                          {contestant.status === 'eliminated' && 'Eliminated'}
                          {contestant.status === 'jury' && `Jury (Wk ${contestant.eliminatedWeek})`}
                          {contestant.status === 'final3' && 'Final 3'}
                          {contestant.status === 'active' && alreadySelectedContestantIds.includes(contestant.id) && 'Already Selected'}
                          {contestant.status === 'active' && 
                           !alreadySelectedContestantIds.includes(contestant.id) && 
                           positionDraftedContestantIds.includes(contestant.id) && 
                           'Already Drafted'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableContestants.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">No available contestants</p>
              </div>
            )}
          </div>

          {/* Footer with Confirm/Cancel buttons - only show when contestant is selected */}
          {selectedContestant && (
            <div className="p-4 lg:p-6 border-t border-slate-800">
              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  style={{ 
                      backgroundColor: '#BFFF0B',
                      color: '#0f172a'
                  }}
                >
                  Confirm Draft
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
