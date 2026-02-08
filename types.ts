
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  REPORT = 'REPORT',
  SKILLS = 'SKILLS'
}

export type VibeLabel = 'Vibing' | 'Flowing' | 'Okay' | 'Awkward' | 'Painful';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  npcRole: string;
  goal: string;
  initialLine: string;
  context: string; // Specific instructions for the NPC Agent
  evaluationCriteria: string; // Specific instructions for the Evaluator Agent
  coverColor: string;
  icon: string; // Emoji or icon character
}

export interface EvaluationReport {
  vibeScore: number;
  openerFeedback: string;
  continuerFeedback: string;
  closerFeedback: string;
  culturalNotes: string;
  killerDetection: string[]; // e.g., "The FBI Agent", "The One-Upper"
  overallSummary: string;
}

export interface TranscriptItem {
  text: string;
  isUser: boolean;
  timestamp: number;
  vibe?: VibeLabel; // Added vibe label for the transcript
}
