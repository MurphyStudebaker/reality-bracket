import { Card } from "../ui/card";

export const PointsBreakdown = () => {
  const pointsRules = [
    { label: "Player is Immune", points: "+10 pts" },
    { label: "Player Makes Jury", points: "+5 pts" },
    { label: "Final 3", points: "+5 pts" },
    { label: "Finishes in Predicted Order", points: "+10 pts" },
    { label: "Correctly Predicted Boot", points: "+15 pts" },
  ];

  return (
    <Card className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm rounded-xl">
      <h3 className="text-white mb-3 font-bold">How Points Work</h3>
      <div className="space-y-2 text-sm">
        {pointsRules.map((rule, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-slate-400">{rule.label}</span>
            <span className="text-[#BFFF0B] font-semibold">
              {rule.points}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
