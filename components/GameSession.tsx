
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Schema, Type } from '@google/genai';
import { Scenario, TranscriptItem, VibeLabel } from '../types';
import { NPC_SYSTEM_INSTRUCTION, REALTIME_JUDGE_SYSTEM_INSTRUCTION, EVALUATOR_SYSTEM_INSTRUCTION, SMALL_TALK_KNOWLEDGE_BASE } from '../constants';
import { LiveSessionManager } from '../services/liveSession';
import { EnergyBar } from './EnergyBar';

interface Props {
  scenario: Scenario;
  durationSeconds: number | null;
  onEndGame: (report: string) => void;
  onAbort: () => void;
}

export const GameSession: React.FC<Props> = ({ scenario, durationSeconds, onEndGame, onAbort }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0); // Audio volume for visualizer
  const [energy, setEnergy] = useState(50); // Game Health (0-100)
  const [streak, setStreak] = useState(0);
  const [lastVibe, setLastVibe] = useState<VibeLabel | null>(null);
  const [statusText, setStatusText] = useState("Initializing Link...");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [coachingTip, setCoachingTip] = useState<string | null>(null);
  const [recoveryActive, setRecoveryActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(durationSeconds);
  
  const sessionRef = useRef<LiveSessionManager | null>(null);
  const transcriptRef = useRef<TranscriptItem[]>([]);
  const lastJudgedIndexRef = useRef<number>(-1); // Track which messages we've already judged
  
  const energyRef = useRef(50); // Ref for sync access in callbacks
  const timeLeftRef = useRef<number | null>(durationSeconds); // Ref for callbacks
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync timeLeftRef
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Adjust NPC Instructions based on Game Mode - CHANGED TO CHARACTER MOTIVATION
  const getModeInstructions = () => {
    if (durationSeconds === 60) {
      return "SITUATION MODIFIER: You are in a rush. You have very little patience. Keep your responses short and punchy because you don't have much time.";
    }
    if (durationSeconds === null) {
      return "SITUATION MODIFIER: You are completely relaxed. You have nowhere to be. You are patient and willing to let the conversation drift.";
    }
    return "SITUATION MODIFIER: A standard social interaction flow.";
  };

  // Prepare the NPC System Prompt (Agent 1 - Character Only)
  const npcSystemInstruction = `
    ${NPC_SYSTEM_INSTRUCTION}
    
    ${SMALL_TALK_KNOWLEDGE_BASE}

    ---
    CURRENT SCENARIO: ${scenario.title}
    DIFFICULTY: ${scenario.difficulty}
    ROLE: ${scenario.npcRole}
    GOAL: ${scenario.goal}
    CONTEXT: ${scenario.context}
    INITIAL LINE: "${scenario.initialLine}"
    
    ${getModeInstructions()}
  `;

  // --- AGENT 2: THE JUDGE (Side-car Async Logic) ---
  const triggerVibeCheck = useCallback(async () => {
    // Find the last User message that hasn't been judged yet
    const transcript = transcriptRef.current;
    let targetIndex = -1;
    
    // Look backwards for the most recent User message
    for (let i = transcript.length - 1; i >= 0; i--) {
      if (transcript[i].isUser) {
        targetIndex = i;
        break;
      }
    }

    // If no user message or we already judged this one, skip
    if (targetIndex === -1 || targetIndex <= lastJudgedIndexRef.current) return;
    
    // Mark as processed
    lastJudgedIndexRef.current = targetIndex;

    const lastUserMsg = transcript[targetIndex];
    const contextHistory = transcript.slice(Math.max(0, targetIndex - 3), targetIndex + 1)
      .map(t => `${t.isUser ? 'User' : 'NPC'}: ${t.text}`).join('\n');

    console.log("Judging User Turn:", lastUserMsg.text);

    try {
      const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use Flash for low latency vibe check
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `SCENARIO: ${scenario.title}\nCONTEXT: ${scenario.context}\n\nTRANSCRIPT:\n${contextHistory}` }] }
        ],
        config: {
          systemInstruction: REALTIME_JUDGE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      });

      const result = JSON.parse(response.text);
      if (result && result.vibe) {
        handleVibeCheck(result.vibe as VibeLabel, result.coaching_tip);
      }
    } catch (e) {
      console.error("Vibe Check Failed", e);
    }
  }, [scenario]);


  // Game Logic Engine
  const handleVibeCheck = useCallback((vibe: VibeLabel, tip?: string) => {
    if (tip) setCoachingTip(tip);

    let energyChange = 0;
    let streakChange = 0;
    let isRecovery = false;

    // Difficulty Scaling Configuration
    let penaltyMultiplier = 1.0;
    let bonusMultiplier = 1.0;

    if (durationSeconds === 60) {
      // Speed Round: High Reward, Low Risk (Forgiving)
      penaltyMultiplier = 0.5;
      bonusMultiplier = 1.5;
    } else if (durationSeconds === null) {
      // Zen Mode: Low Risk (Forgiving)
      penaltyMultiplier = 0.5;
    }

    // Comeback Logic: If energy is low (< 40) and vibe is good, boost it
    const isDangerZone = energyRef.current < 40;

    switch (vibe) {
      case 'Vibing':
        energyChange = 10 * bonusMultiplier;
        streakChange = 1;
        if (isDangerZone) {
          energyChange = 15 * bonusMultiplier; // Comeback Bonus!
          isRecovery = true;
        }
        break;
      case 'Flowing':
        energyChange = 5 * bonusMultiplier;
        streakChange = 1;
        if (isDangerZone) {
          energyChange = 8 * bonusMultiplier; // Slight Comeback Bonus
          isRecovery = true;
        }
        break;
      case 'Okay':
        energyChange = -2 * penaltyMultiplier;
        streakChange = 0;
        break;
      case 'Awkward':
        energyChange = -10 * penaltyMultiplier;
        streakChange = -streak; // Reset
        break;
      case 'Painful':
        energyChange = -20 * penaltyMultiplier;
        streakChange = -streak; // Reset
        break;
    }

    setRecoveryActive(isRecovery);
    if (isRecovery) {
      setTimeout(() => setRecoveryActive(false), 2000);
    }

    const newEnergy = Math.max(0, Math.min(100, energyRef.current + Math.round(energyChange)));
    energyRef.current = newEnergy;
    
    setEnergy(newEnergy);
    setStreak(prev => (streakChange < 0 ? 0 : prev + streakChange));
    setLastVibe(vibe);

    // Record Vibe in Transcript for Evaluator (Find the last user item and tag it)
    // Note: Since we are async, we find the item we just judged
    const transcript = transcriptRef.current;
    if (lastJudgedIndexRef.current >= 0 && lastJudgedIndexRef.current < transcript.length) {
      transcript[lastJudgedIndexRef.current].vibe = vibe;
    }

    if (newEnergy === 0) {
      // Trigger Game Over
      sessionRef.current?.disconnect();
      setStatusText("SOCIAL BATTERY DEPLETED.");
      setTimeout(() => {
        handleEndSession();
      }, 2000);
    }

    return newEnergy;
  }, [durationSeconds]); 

  const handleEndSession = useCallback(async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    setStatusText("Analyzing Performance...");
    
    sessionRef.current?.disconnect();

    const fullTranscript = transcriptRef.current
      .map(t => `[${t.timestamp}] ${t.isUser ? 'User' : 'NPC'} (${t.vibe || ''}): ${t.text}`)
      .join('\n');

    try {
      const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: "Evaluate this conversation based on your instructions." }] },
          { role: 'user', parts: [{ text: fullTranscript }] }
        ],
        config: {
          systemInstruction: `${EVALUATOR_SYSTEM_INSTRUCTION} \n SCENARIO: ${scenario.title} \n ${SMALL_TALK_KNOWLEDGE_BASE}`,
          responseMimeType: 'application/json'
        }
      });

      const result = response.text;
      if (result) {
        onEndGame(result);
      } else {
        throw new Error("No evaluation generated");
      }

    } catch (e) {
      console.error("Evaluation failed", e);
      onEndGame(JSON.stringify({ 
        overallSummary: "Evaluation failed due to network error, but good effort!",
        vibeScore: energyRef.current,
        killerDetection: [],
        openerFeedback: "N/A",
        continuerFeedback: "N/A",
        closerFeedback: "N/A",
        culturalNotes: "N/A"
      }));
    }
  }, [isEvaluating, scenario.title, onEndGame]);

  // Timer Logic
  useEffect(() => {
    if (durationSeconds === null || !isConnected) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatusText("TIME'S UP!");
          setTimeout(handleEndSession, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationSeconds, isConnected, handleEndSession]);

  const initSession = useCallback(async () => {
    if (!process.env.API_KEY) {
      alert("API_KEY missing in environment");
      return;
    }

    const manager = new LiveSessionManager(process.env.API_KEY, {
      onConnect: () => {
        setIsConnected(true);
        setStatusText("Connected. Speak now.");
      },
      onDisconnect: () => {
        setIsConnected(false);
        if (!isEvaluating && energyRef.current > 0 && timeLeftRef.current !== 0) {
            setStatusText("Connection Lost.");
        }
      },
      onVolumeChange: (vol) => {
        setVolume(vol);
      },
      onTranscriptUpdate: (item) => {
        transcriptRef.current.push(item);
        // If it's an NPC response, it means the User turn before it is definitively over.
        // OR if it's a User response, we can speculatively judge it (but waiting for NPC start is safer for context).
        // Strategy: Judge as soon as we detect the NPC is starting to talk (isUser: false)
        if (!item.isUser) {
           triggerVibeCheck();
        }
      }
    });

    sessionRef.current = manager;
    // Connect WITHOUT tools - Pure Character Mode
    await manager.connect(npcSystemInstruction, []); 
  }, [npcSystemInstruction, isEvaluating, triggerVibeCheck]); 

  useEffect(() => {
    initSession();
    return () => {
      sessionRef.current?.disconnect();
    };
  }, [initSession]);

  const getVibeColor = (vibe: VibeLabel | null) => {
    switch (vibe) {
      case 'Vibing': return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]';
      case 'Flowing': return 'text-blue-400';
      case 'Okay': return 'text-slate-400';
      case 'Awkward': return 'text-yellow-500';
      case 'Painful': return 'text-rose-500';
      default: return 'text-transparent';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-transparent">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 ${
        energy < 30 ? 'bg-rose-900' : 
        energy > 75 ? 'bg-emerald-900' : 'bg-slate-900'
      }`} />

      {/* Recovery Effect Overlay */}
      {recoveryActive && (
        <div className="absolute inset-0 z-0 bg-emerald-500/10 pointer-events-none animate-pulse" />
      )}

      {/* HUD - Objective */}
      <div className="absolute top-20 left-4 p-4 border border-slate-700 rounded-lg bg-slate-800/50 backdrop-blur-md max-w-xs hidden md:block">
        <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Objective</h4>
        <p className="text-sm text-slate-200">{scenario.goal}</p>
      </div>

      {/* HUD - Timer */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className={`text-3xl font-mono font-bold tracking-wider ${
          timeLeft !== null && timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'
        } drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
          {timeLeft !== null ? formatTime(timeLeft) : '∞'}
        </div>
      </div>

      {/* HUD - Coaching Hint */}
      {coachingTip && (
        <div className="absolute top-20 right-4 p-4 border border-purple-500/30 rounded-lg bg-slate-800/80 backdrop-blur-md max-w-xs hidden md:block animate-in fade-in slide-in-from-right-4">
          <h4 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span className="animate-pulse">💡</span> Coach's Corner
          </h4>
          <p className="text-sm text-slate-200 italic">"{coachingTip}"</p>
        </div>
      )}

      {/* Main Game Area */}
      <div className="w-full max-w-2xl text-center relative z-10">
        
        {/* Vibe Feedback (Floating Text) */}
        <div className="h-12 mb-4 flex items-center justify-center relative">
          {lastVibe && !recoveryActive && (
            <span key={`vibe-${Date.now()}`} className={`text-3xl font-black italic animate-bounce-short ${getVibeColor(lastVibe)}`}>
              {lastVibe.toUpperCase()}
            </span>
          )}
          {recoveryActive && (
            <span key={`recovery-${Date.now()}`} className="text-4xl font-black italic text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,1)] animate-bounce-short">
              COMEBACK! +15
            </span>
          )}
        </div>

        {/* Avatar / Visualizer */}
        <div className={`w-64 h-64 mx-auto mb-8 rounded-full border-4 flex items-center justify-center bg-slate-800 relative overflow-hidden shadow-2xl transition-colors duration-500 ${
          energy < 30 ? 'border-rose-500/50' : 'border-slate-700'
        }`}>
          {(!isConnected || isEvaluating) && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
               <span className="animate-pulse text-purple-400 font-mono text-lg">{statusText}</span>
             </div>
          )}
          
          {/* Reactive Visualizer */}
          <div 
            className={`w-32 h-32 rounded-full transition-all duration-75 ${
              volume > 5 ? 'bg-purple-500 blur-md' : 'bg-slate-700'
            }`}
            style={{ 
              transform: `scale(${1 + volume * 2})`,
              opacity: 0.8
            }} 
          />
          
          <div className="absolute text-6xl select-none animate-pulse opacity-50">
            {scenario.icon}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-white">{scenario.title}</h2>
        <p className="text-slate-400 mb-8 font-mono text-sm max-w-lg mx-auto">
          {npcSystemInstruction.includes(scenario.initialLine) && transcriptRef.current.length === 0 ? 
            `"${scenario.initialLine}"` : 
            transcriptRef.current.length > 0 && transcriptRef.current[transcriptRef.current.length-1].isUser ? 
            "Thinking..." : 
            "NPC Speaking..."
          }
        </p>

        {/* Game Stats */}
        <EnergyBar energy={energy} streak={streak} />

        {/* Controls */}
        <div className="flex gap-4 justify-center mt-12">
          <button 
            onClick={onAbort}
            disabled={isEvaluating}
            className="px-6 py-3 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-mono text-sm uppercase disabled:opacity-50"
          >
            Abort
          </button>
          <button 
            onClick={handleEndSession}
            disabled={isEvaluating}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold hover:shadow-lg hover:shadow-rose-500/25 transition-all transform hover:-translate-y-0.5 disabled:grayscale"
          >
            {isEvaluating ? 'Evaluating...' : 'Graceful Exit (Finish)'}
          </button>
        </div>
      </div>
    </div>
  );
};
