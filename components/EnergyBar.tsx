
import React from 'react';

interface Props {
  energy: number; // 0-100 (Game Health)
  streak: number;
}

export const EnergyBar: React.FC<Props> = ({ energy, streak }) => {
  // Determine color based on score
  const getColor = () => {
    if (energy > 75) return 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.6)]';
    if (energy > 25) return 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
    return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse';
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between items-end mb-2">
        <div className="text-xs font-mono text-slate-400">
          SOCIAL BATTERY
        </div>
        {streak > 1 && (
          <div className="text-xs font-bold font-mono text-purple-400 animate-bounce">
            {streak}x COMBO!
          </div>
        )}
      </div>
      
      <div className="h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
        <div 
          className={`h-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${getColor()}`}
          style={{ width: `${energy}%` }}
        />
        
        {/* Threshold Markers */}
        <div className="absolute top-0 bottom-0 left-[25%] w-px bg-slate-900/50 border-r border-white/10" />
        <div className="absolute top-0 bottom-0 left-[75%] w-px bg-slate-900/50 border-r border-white/10" />
        
        {/* Glint effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-full pointer-events-none" />
      </div>
      
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-600 mt-1 font-mono">
        <span>Cold</span>
        <span>Neutral</span>
        <span>Warm</span>
      </div>
    </div>
  );
};
