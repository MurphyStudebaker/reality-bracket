import React, { useState, useEffect, useRef } from 'react';
import { X, GripVertical, Save, Shuffle } from 'lucide-react';
import { usePostHog } from '@posthog/react';
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
  const posthog = usePostHog();
  const [members, setMembers] = useState<DraftOrderMember[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const prevFetchedMembersRef = useRef<string>('');
  const dragStartIndexRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => setIsDesktop(mediaQuery.matches);
    handleChange();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const handleDragStart = (index: number) => {
    dragStartIndexRef.current = index;
    setDraggedIndex(index);
  };

  const moveMember = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setMembers(prevMembers => {
      const nextMembers = [...prevMembers];
      const [draggedItem] = nextMembers.splice(fromIndex, 1);
      nextMembers.splice(toIndex, 0, draggedItem);
      return nextMembers;
    });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    moveMember(draggedIndex, index);
    setDraggedIndex(index);
  };

  const captureManualReorder = (inputMethod: 'desktop_drag' | 'touch_drag') => {
    const fromIndex = dragStartIndexRef.current;
    if (fromIndex === null || draggedIndex === null || fromIndex === draggedIndex || !leagueId) {
      return;
    }

    posthog.capture('league_order_dragged_and_dropped', {
      league_id: leagueId,
      from_position: fromIndex + 1,
      to_position: draggedIndex + 1,
      member_count: members.length,
      input_method: inputMethod,
    });
  };

  const handleDragEnd = () => {
    captureManualReorder('desktop_drag');
    dragStartIndexRef.current = null;
    setDraggedIndex(null);
  };

  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    if (e.pointerType !== 'touch') return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStartIndexRef.current = index;
    setDraggedIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    if (draggedIndex === null) return;
    e.preventDefault();

    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!target) return;

    const item = target.closest('[data-draft-index]') as HTMLElement | null;
    if (!item) return;

    const targetIndex = Number(item.dataset.draftIndex);
    if (Number.isNaN(targetIndex) || targetIndex === draggedIndex) return;

    moveMember(draggedIndex, targetIndex);
    setDraggedIndex(targetIndex);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    e.preventDefault();
    captureManualReorder('touch_drag');
    dragStartIndexRef.current = null;
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

  const handleShuffle = () => {
    if (leagueId) {
      posthog.capture('league_order_randomized', {
        league_id: leagueId,
        member_count: members.length,
      });
    }

    setMembers(prevMembers => {
      if (prevMembers.length <= 1) return prevMembers;
      const nextMembers = [...prevMembers];
      for (let i = nextMembers.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [nextMembers[i], nextMembers[j]] = [nextMembers[j], nextMembers[i]];
      }
      return nextMembers;
    });
  };

  if (!isOpen) return null;

  const displayName = (member: DraftOrderMember) => 
    member.displayName || member.username || `Player ${member.userId.substring(0, 8)}`;

  const header = (
    <div className="sticky top-0 z-10 flex items-center justify-between p-6 lg:p-8 border-b border-slate-800 bg-slate-900 rounded-t-2xl lg:rounded-2xl">
      <div>
        <h2 className="text-xl">Modify Draft Order</h2>
        <p className="text-sm text-slate-400 mt-1">
          { isDesktop ? 'Drag and drop to reorder. Default order is based on join date.' : 'Use a desktop to manually set the draft order.' }
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
        className="flex-1 px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        style={{
          backgroundColor: '#BFFF0B',
          color: '#0f172a',
        }}
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

  const bodyContent = isLoading ? (
    <div className="flex items-center justify-center py-8">
      <div className="text-slate-400">Loading members...</div>
    </div>
  ) : members.length === 0 ? (
    <div className="text-center text-slate-400 py-8">
      <p>No league members found.</p>
    </div>
  ) : (
    <>
      <div className="mb-4">
        <Button
          onClick={handleShuffle}
          disabled={isSaving || isLoading || members.length === 0}
          variant="outline"
          className="w-full px-6 py-8 rounded-xl border-2 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] hover:opacity-90 active:opacity-80"
          style={{
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                color: '#94a3b8',
                padding: '2rem',
          }}
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle Draft Order
        </Button>
      </div>
      <div className="space-y-2">
        {members.map((member, index) => (
          <div
            key={member.id}
            draggable={isDesktop}
            onDragStart={isDesktop ? () => handleDragStart(index) : undefined}
            onDragOver={isDesktop ? (e) => handleDragOver(e, index) : undefined}
            onDragEnd={isDesktop ? handleDragEnd : undefined}
            onPointerDown={isDesktop ? (e) => handlePointerDown(e, index) : undefined}
            onPointerMove={isDesktop ? handlePointerMove : undefined}
            onPointerUp={isDesktop ? handlePointerUp : undefined}
            onPointerCancel={isDesktop ? handlePointerUp : undefined}
            data-draft-index={index}
            className={`
              bg-slate-800/50 rounded-xl p-4 ${isDesktop ? 'cursor-move' : 'cursor-default'}
              transition-all hover:bg-slate-800
              ${draggedIndex === index ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              {isDesktop && (
                <div className="flex-shrink-0">
                  <GripVertical className="w-5 h-5 text-slate-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-300">
                    {index + 1}.
                  </span>
                  <span className="text-sm font-medium text-white truncate">
                    {displayName(member)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const body = (
    <div style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {bodyContent}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      bodyClassName="p-6 lg:p-8"
      footer={footer}
      children={body}
    />
  );
}

