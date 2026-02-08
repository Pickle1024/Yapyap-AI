import React, { useState } from 'react';
import { SCENARIOS } from '../constants';
import { Scenario } from '../types';

interface Props {
  onSelect: (scenario: Scenario, duration: number | null) => void;
  onOpenSkills: () => void;
}

export const ScenarioSelect: React.FC<Props> = ({ onSelect, onOpenSkills }) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(180); // Default 3 min

  const durationOptions = [
    { label: 'Speed Round (1m)', value: 60, icon: '⚡' },
    { label: 'Standard (3m)', value: 180, icon: '⏱️' },
    { label: 'Practice (∞)', value: null, icon: '🧘' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-bold mb-2 tracking-tight">Choose Your Vibe</h2>
          <p className="text-slate-400 text-lg">Select a social scenario to simulate.</p>
        </div>
        <button 
          onClick={onOpenSkills}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 border border-slate-700 text-purple-300 hover:text-white hover:bg-purple-900/20 hover:border-purple-500 transition-all font-mono whitespace-nowrap shadow-lg shadow-purple-900/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          Skills Database
        </button>
      </div>

      {/* Game Mode Selector */}
      <div className="mb-10 flex flex-col items-start">
        <label className="text-xs font-mono uppercase text-slate-500 mb-3 tracking-widest">Select Duration</label>
        <div className="bg-slate-800/50 p-1.5 rounded-xl border border-slate-700 backdrop-blur-sm inline-flex flex-wrap gap-1">
          {durationOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setSelectedDuration(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedDuration === opt.value
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((scenario) => (
          <div 
            key={scenario.id}
            className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col"
            onClick={() => onSelect(scenario, selectedDuration)}
          >
            {/* Top Color Bar */}
            <div className={`h-2 ${scenario.coverColor} w-full`} />
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center text-3xl shadow-inner border border-slate-600/50 group-hover:scale-110 transition-transform duration-300">
                  {scenario.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border uppercase tracking-wider ${
                  scenario.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-900/10' :
                  scenario.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-900/10' :
                  'border-rose-500/30 text-rose-400 bg-rose-900/10'
                }`}>
                  {scenario.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors leading-tight">
                {scenario.title}
              </h3>
              
              <p className="text-sm text-slate-400 mb-6 leading-relaxed flex-1">
                {scenario.description}
              </p>
              
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center text-xs text-slate-500 font-mono gap-2 mb-1">
                  <span className="text-slate-600">NPC:</span>
                  <span className="text-slate-300">{scenario.npcRole}</span>
                </div>
                <div className="flex items-start text-xs text-slate-500 font-mono gap-2">
                  <span className="text-slate-600 mt-0.5">GOAL:</span>
                  <span className="text-slate-300 italic">{scenario.goal}</span>
                </div>
              </div>
            </div>
            
            {/* Hover Glint */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};