import React, { useState, useEffect, useRef } from 'react';
import { X, GripVertical, Save } from 'lucide-react';
import useSWR from 'swr';
import BaseModal from './BaseModal';
import { SupabaseService } from '../../services/supabaseService';
import { fetcher, createKey } from '../../lib/swr';
import { Button } from '../ui/button';

interface DraftOrderMember {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  draftOrder: number | null;
  joinedAt: string;
}

interface ModifyDraftOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  leagueId: string | null;
}

export default function ModifyDraftOrderModal({
  isOpen,
  onClose,
  leagueId,
}: ModifyDraftOrderModalProps) {
  const [members, setMembers] = useState<DraftOrderMember[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const prevFetchedMembersRef = useRef<string>('');

  // Fetch league members for draft order
  const membersKey = createKey('draft-order-members', leagueId);
  const { data: fetchedMembers = [], isLoading, mutate: mutateMembers } = useSWR<DraftOrderMember[]>(
    isOpen && leagueId ? membersKey : null,
    async () => {
      if (!leagueId) return [];
      return await SupabaseService.getLeagueMembersForDraftOrder(leagueId);
    }
  );

  // Initialize members when data is loaded and modal is open
  useEffect(() => {
    if (!isOpen || !leagueId) {
      if (members.length > 0) {
        setMembers([]);
      }
      prevFetchedMembersRef.current = '';
      return;
    }

    if (isLoading) {
      return; // Don't update while loading
    }

    // Create a stable string representation of fetched members to detect changes
    const fetchedMembersKey = fetchedMembers.map(m => `${m.id}:${m.draftOrder}`).sort().join('|');
    
    // Only update if the fetched data actually changed
    if (prevFetchedMembersRef.current === fetchedMembersKey) {
      return;
    }

    prevFetchedMembersRef.current = fetchedMembersKey;

    if (fetchedMembers.length > 0) {
      // Sort by draft_order (nulls last), then by joined_at
      const sorted = [...fetchedMembers].sort((a, b) => {
        if (a.draftOrder !== null && b.draftOrder !== null) {
          return a.draftOrder - b.draftOrder;
        }
        if (a.draftOrder !== null) return -1;
        if (b.draftOrder !== null) return 1;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      });
      
      setMembers(sorted);
    } else {
      setMembers([]);
    }
  }, [fetchedMembers, isLoading, isOpen, leagueId]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const draggedItem = members[draggedIndex];
    const newMembers = [...members];
    newMembers.splice(draggedIndex, 1);
    newMembers.splice(index, 0, draggedItem);
    setMembers(newMembers);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    if (!leagueId) return;

    setIsSaving(true);
    try {
      // Create array of member orders
      const memberOrders = members.map((member, index) => ({
        memberId: member.id,
        draftOrder: index + 1, // 1-based order
      }));

      const success = await SupabaseService.updateDraftOrder(leagueId, memberOrders);

      if (success) {
        // Close modal - parent component should handle cache invalidation
        onClose();
      } else {
        alert('Failed to save draft order. Please try again.');
      }
    } catch (error) {
      console.error('Error saving draft order:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const displayName = (member: DraftOrderMember) => 
    member.displayName || member.username || `Player ${member.userId.substring(0, 8)}`;

  const header = (
    <div className="sticky top-0 z-10 flex items-center justify-between p-6 lg:p-8 border-b border-slate-800 bg-slate-900">
      <div>
        <h2 className="text-xl">Modify Draft Order</h2>
        <p className="text-sm text-slate-400 mt-1">
          Drag and drop to reorder. Default order is based on join date.
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  const footer = (
    <div className="flex gap-3">
      <Button
        onClick={onClose}
        variant="outline"
        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSave}
        disabled={isSaving || isLoading || members.length === 0}
        className="flex-1 font-semibold"
        style={{ backgroundColor: '#BFFF0B', color: '#000' }}
      >
        {isSaving ? (
          'Saving...'
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Order
          </>
        )}
      </Button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      bodyClassName="p-6 lg:p-8"
      footer={footer}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-400">Loading members...</div>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center text-slate-400 py-8">
          <p>No league members found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member, index) => (
            <div
              key={member.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                bg-slate-800/50 rounded-xl p-4 cursor-move
                transition-all hover:bg-slate-800
                ${draggedIndex === index ? 'opacity-50' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <GripVertical className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-300">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium text-white truncate">
                      {displayName(member)}
                    </span>
                  </div>
                  {member.displayName && member.displayName !== member.username && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      @{member.username}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </BaseModal>
  );
}

