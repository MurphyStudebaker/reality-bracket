import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

interface JoinLeagueFormProps {
  inviteCode: string;
  onInviteCodeChange: (code: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const JoinLeagueForm = ({
  inviteCode,
  onInviteCodeChange,
  onSubmit,
  canSubmit,
}: JoinLeagueFormProps) => {
  return (
    <div className="space-y-6 mt-8 pb-6 px-1 min-h-[500px]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inviteCode" className="text-white text-sm">
            Invite Code
          </Label>
          <Input
            id="inviteCode"
            placeholder="Enter 6-digit code"
            value={inviteCode}
            onChange={(e) => onInviteCodeChange(e.target.value)}
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 text-center tracking-widest text-lg"
            maxLength={6}
          />
          <p className="text-xs text-slate-500">
            Ask your league commissioner for the invite code
          </p>
        </div>
      </div>
      <Button
        className="w-full bg-[#BFFF0B] hover:bg-[#a8e609] text-black h-12 shadow-lg shadow-[#BFFF0B]/20 font-bold"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        Join League
      </Button>
    </div>
  );
};
