
import React, { useState } from 'react';
import { generatePracticeText, evaluateSession, analyzeMistakes, generateFloodText, generateBombText, generateShooterWords, generateRacingWords } from './services/geminiService';
import TypingArea from './components/TypingArea';
import FloodGame from './components/FloodGame';
import BombGame from './components/BombGame';
import ShooterGame from './components/ShooterGame';
import DriftGame from './components/DriftGame';
import ResultsView from './components/ResultsView';
import ModeSelector from './components/ModeSelector';
import { AppState, EvaluationResult, MistakeAnalysis, DifficultyMode, GameType } from './types';
import { Keyboard, Loader2, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [practiceText, setPracticeText] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [mistakeAnalysis, setMistakeAnalysis] = useState<MistakeAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // New state for difficulty and game mode
  const [difficulty, setDifficulty] = useState<DifficultyMode>('INTERMEDIATE');
  const [gameMode, setGameMode] = useState<GameType>('STANDARD');
  const [gameWon, setGameWon] = useState<boolean | null>(null);

  // Needed for analysis context
  const [lastOriginalText, setLastOriginalText] = useState<string>('');
  const [lastTypedText, setLastTypedText] = useState<string>('');

  const startGame = async (selectedDifficulty: DifficultyMode, selectedGameMode: GameType) => {
    setDifficulty(selectedDifficulty);
    setGameMode(selectedGameMode);
    setGameWon(null);
    setMistakeAnalysis(null);
    setErrorMsg('');
    setAppState(AppState.GENERATING_TEXT);

    try {
      let text = '';
      if (selectedGameMode === 'FLOOD_ESCAPE') {
        text = await generateFloodText(selectedDifficulty);
      } else if (selectedGameMode === 'BOMB_DEFUSE') {
        text = await generateBombText(selectedDifficulty);
      } else if (selectedGameMode === 'STICKMAN_SHOOTER') {
        text = await generateShooterWords(selectedDifficulty);
      } else if (selectedGameMode === 'DRIFT_RACING') {
        text = await generateRacingWords(selectedDifficulty);
      } else {
        text = await generatePracticeText(selectedDifficulty);
      }
      
      setPracticeText(text);
      setLastOriginalText(text);
      setAppState(AppState.TYPING);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load content. Please check your internet or API key.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReturnToMenu = () => {
    setAppState(AppState.IDLE);
    setEvaluationResult(null);
    setMistakeAnalysis(null);
    setGameWon(null);
  };

  const handleTypingComplete = async (typedText: string, timeTaken: number) => {
    setLastTypedText(typedText);
    setAppState(AppState.ANALYZING);

    // Game Win/Loss Logic
    if (gameMode === 'FLOOD_ESCAPE') {
        const isCompleted = typedText.length >= practiceText.length;
        const won = isCompleted && timeTaken < 60;
        setGameWon(won);
    } else if (gameMode === 'BOMB_DEFUSE') {
        const won = typedText === practiceText;
        setGameWon(won);
    } else if (gameMode === 'STICKMAN_SHOOTER') {
        // If they typed the full string (which contains all words), they won.
        // If truncated, lost.
        const won = typedText.length >= practiceText.length;
        setGameWon(won);
    } else if (gameMode === 'DRIFT_RACING') {
        // Drift racing has no "complete text" condition in the same way, 
        // passing is based on survival.
        setGameWon(true); // Default to win if completed without crash (crash sets game state internally)
        // Check if crash happened by checking if length is very short vs time?
        // Actually, DriftGame calls onComplete with full text if Won, partial if Lost.
        if (typedText.length < 20) {
             setGameWon(false); // Rough heuristic if needed, but DriftGame handles its internal state display
        }
    }

    try {
      const result = await evaluateSession(practiceText, typedText, timeTaken);
      setEvaluationResult(result);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze results.");
      setAppState(AppState.ERROR);
    }
  };

  const handleAnalyzeMistakes = async () => {
    if (!evaluationResult) return;
    
    setAppState(AppState.GENERATING_ANALYSIS);
    try {
      const analysis = await analyzeMistakes(
        lastOriginalText,
        lastTypedText,
        evaluationResult.mistyped_words,
        evaluationResult.missed_words,
        evaluationResult.accuracy
      );
      setMistakeAnalysis(analysis);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate practice plan.");
      setAppState(AppState.RESULTS); // Go back to results even if analysis fails, just won't show it
    }
  };

  const handleStartRemedial = (text: string) => {
    setPracticeText(text);
    setLastOriginalText(text); // Track this for the next cycle if they want to analyze the remedial session too
    setMistakeAnalysis(null); // Clear analysis when starting new practice
    setGameMode('STANDARD'); // Remedial is always standard
    setGameWon(null);
    setAppState(AppState.TYPING);
  };

  const restartAction = () => {
    startGame(difficulty, gameMode);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return <ModeSelector onStart={startGame} />;
        
      case AppState.GENERATING_TEXT:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                <Loader2 className="w-12 h-12 text-white animate-spin relative z-10" />
            </div>
            <p className="text-zinc-400 font-mono animate-pulse">
                {gameMode === 'FLOOD_ESCAPE' ? 'Preparing level...' : 
                 gameMode === 'BOMB_DEFUSE' ? 'Arming detonator...' : 
                 gameMode === 'STICKMAN_SHOOTER' ? 'Loading weapon systems...' :
                 gameMode === 'DRIFT_RACING' ? 'Revving engine...' :
                 `Generating ${difficulty.toLowerCase()} practice...`}
            </p>
          </div>
        );

      case AppState.TYPING:
        if (gameMode === 'FLOOD_ESCAPE') {
            return (
                <FloodGame 
                    originalText={practiceText} 
                    onComplete={handleTypingComplete}
                    onRestart={restartAction}
                />
            );
        } else if (gameMode === 'BOMB_DEFUSE') {
            return (
                <BombGame 
                    originalText={practiceText} 
                    onComplete={handleTypingComplete}
                    onRestart={restartAction}
                />
            );
        } else if (gameMode === 'STICKMAN_SHOOTER') {
            return (
                <ShooterGame
                    originalText={practiceText} 
                    onComplete={handleTypingComplete}
                    onRestart={restartAction}
                    difficulty={difficulty}
                />
            );
        } else if (gameMode === 'DRIFT_RACING') {
             return (
                <DriftGame
                    originalText={practiceText} 
                    onComplete={handleTypingComplete}
                    onRestart={restartAction}
                    difficulty={difficulty}
                />
            );
        }
        return (
          <TypingArea 
            originalText={practiceText} 
            onComplete={handleTypingComplete}
            onRestart={restartAction}
            isSubmitting={false}
          />
        );
      
      case AppState.ANALYZING:
        // Keep the visual of the previous screen while loading, or show loading
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
                <div className="text-xl font-medium text-white">Analyzing Performance...</div>
                <div className="text-zinc-400 text-sm">Gemini is evaluating your speed and accuracy</div>
            </div>
        )

      case AppState.RESULTS:
      case AppState.GENERATING_ANALYSIS:
        return evaluationResult ? (
          <ResultsView 
            result={evaluationResult} 
            onRestart={handleReturnToMenu} 
            onAnalyze={handleAnalyzeMistakes}
            onStartRemedial={handleStartRemedial}
            analysis={mistakeAnalysis}
            isAnalyzing={appState === AppState.GENERATING_ANALYSIS}
            gameStatus={gameMode !== 'STANDARD' ? (gameWon ? 'WON' : 'LOST') : null}
            gameType={gameMode}
          />
        ) : null;

      case AppState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400">
                {errorMsg}
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={handleReturnToMenu}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors border border-zinc-700"
                >
                    Back to Menu
                </button>
                <button 
                    onClick={restartAction}
                    className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg transition-colors font-medium"
                >
                    Try Again
                </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen font-sans selection:bg-white/20 selection:text-white"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, #18181b 0%, #000000 100%)',
        backgroundSize: '100% 100%',
        backgroundColor: '#000000'
      }}
    >
      
      {/* Navbar */}
      <header className="border-b border-zinc-800/50 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 group cursor-default">
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors border border-white/5">
                <Keyboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Swift<span className="text-zinc-400">Fingers</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
             {appState !== AppState.IDLE && (
                <button 
                    onClick={handleReturnToMenu}
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                >
                    <ArrowLeft size={14} />
                    Change Mode
                </button>
             )}
             <span className="px-3 py-1 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs font-medium text-zinc-400 hidden sm:inline-block backdrop-blur-sm">
                AI Powered Typing Assistant
             </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center w-full">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-4 text-center text-zinc-600 text-xs pointer-events-none">
        <p>Build v1.2 • Survival of the Fastest</p>
      </footer>
    </div>
  );
};

export default App;
