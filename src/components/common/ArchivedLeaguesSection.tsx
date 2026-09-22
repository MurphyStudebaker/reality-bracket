import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { cn } from '../ui/utils';

interface ArchivedLeaguesSectionProps {
  count: number;
  children: React.ReactNode;
}

export default function ArchivedLeaguesSection({
  count,
  children,
}: ArchivedLeaguesSectionProps) {
  const [open, setOpen] = useState(false);

  if (count === 0) {
    return null;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800/50">
        <span>Archived leagues ({count})</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}
