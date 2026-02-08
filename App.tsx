import React, { useState } from 'react';
import { GameState, Scenario } from './types';
import { ScenarioSelect } from './components/ScenarioSelect';
import { GameSession } from './components/GameSession';
import { PostGameReport } from './components/PostGameReport';
import { Header } from './components/Header';
import { SkillsPage } from './components/SkillsPage';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [gameDuration, setGameDuration] = useState<number | null>(180); // Default 3 mins
  const [finalReport, setFinalReport] = useState<string>('');

  const startGame = (scenario: Scenario, duration: number | null) => {
    setCurrentScenario(scenario);
    setGameDuration(duration);
    setGameState(GameState.PLAYING);
  };

  const endGame = (report: string) => {
    setFinalReport(report);
    setGameState(GameState.REPORT);
  };

  const resetGame = () => {
    setGameState(GameState.MENU);
    setCurrentScenario(null);
    setFinalReport('');
  };

  const openSkills = () => {
    setGameState(GameState.SKILLS);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 relative flex flex-col overflow-hidden z-30">
        {gameState === GameState.MENU && (
          <ScenarioSelect onSelect={startGame} onOpenSkills={openSkills} />
        )}

        {gameState === GameState.SKILLS && (
          <SkillsPage onBack={resetGame} />
        )}

        {gameState === GameState.PLAYING && currentScenario && (
          <GameSession 
            scenario={currentScenario} 
            durationSeconds={gameDuration}
            onEndGame={endGame}
            onAbort={resetGame}
          />
        )}

        {gameState === GameState.REPORT && (
          <PostGameReport 
            report={finalReport} 
            onRestart={resetGame} 
          />
        )}
      </main>
    </div>
  );
};

export default App;