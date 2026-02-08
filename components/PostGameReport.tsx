import React from 'react';
import { EvaluationReport } from '../types';

interface Props {
  report: string; // JSON string
  onRestart: () => void;
}

export const PostGameReport: React.FC<Props> = ({ report, onRestart }) => {
  let data: EvaluationReport | null = null;
  try {
    data = JSON.parse(report);
  } catch (e) {
    console.error("Failed to parse report", e);
  }

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-rose-400 mb-4">Error generating report. The vibes were too complex.</div>
        <button onClick={onRestart} className="px-4 py-2 bg-white text-black rounded">Try Again</button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-rose-400';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 my-8">
        
        {/* Header Score Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Vibe Check</h2>
              <p className="text-slate-400 font-mono text-sm">Session Debriefing</p>
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-6xl font-black ${getScoreColor(data.vibeScore)}`}>{data.vibeScore}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">Social Score</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-slate-300 italic">"{data.overallSummary}"</p>
          </div>
        </div>

        {/* Detailed Feedback Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-lg">👋</span> The Opener
            </h3>
            <p className="text-sm text-slate-300">{data.openerFeedback}</p>
          </div>
          
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-lg">🔄</span> The Flow (Continuers)
            </h3>
            <p className="text-sm text-slate-300">{data.continuerFeedback}</p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-pink-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-lg">🚪</span> The Exit
            </h3>
            <p className="text-sm text-slate-300">{data.closerFeedback}</p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
              <span className="text-lg">⚠️</span> Killer Detection
            </h3>
            {data.killerDetection.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.killerDetection.map((k, i) => (
                  <span key={i} className="px-2 py-1 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">
                    {k}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-emerald-400">Clean record! No conversational crimes detected.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center pb-8">
          <button 
            onClick={onRestart}
            className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-purple-50 hover:scale-105 transition-all shadow-lg shadow-purple-500/20 uppercase tracking-widest text-sm"
          >
            Train Again
          </button>
        </div>

      </div>
    </div>
  );
};