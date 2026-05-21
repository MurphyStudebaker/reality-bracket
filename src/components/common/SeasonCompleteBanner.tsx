import React from 'react';

export default function SeasonCompleteBanner() {
  return (
    <div className="mb-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl border-2 border-purple-600/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-purple-300 font-semibold mb-1">Season Complete</h3>
          <p className="text-purple-200/80 text-sm">
            This season is over. Final standings are locked and weekly boot picks are closed.
          </p>
        </div>
      </div>
    </div>
  );
}
