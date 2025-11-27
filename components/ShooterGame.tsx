
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Crosshair, Skull, Trophy, Activity, Zap, Clock, AlertCircle } from 'lucide-react';
import { DifficultyMode } from '../types';
import { GlowingEffect } from './ui/glowing-effect';

interface ShooterGameProps {
  originalText: string;
  onComplete: (typedText: string, timeTaken: number) => void;
  onRestart: () => void;
  difficulty: DifficultyMode;
}

interface ActiveWord {
  id: string;
  text: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage (of GAME_HEIGHT)
  speed: number;
  completedChars: number; // how many chars typed correctly so far
  isTargeted: boolean;
  spawnTime: number;
}

interface GameMetrics {
  wordsDestroyed: number;
  attempts: number; // Total keystrokes
  mistakes: string[]; // Array of mismatched chars
  correctKeystrokes: number;
  wordsPresented: number;
  currentStreak: number;
  longestStreak: number;
  hardestWord: string;
  maxWordDuration: number;
  longestWordLen: number;
}

const GAME_HEIGHT = 600;
const BOTTOM_THRESHOLD = 85; // % where game over happens (stickman position)
const SPAWN_INTERVAL_MS = 1500; 

const ShooterGame: React.FC<ShooterGameProps> = ({ originalText, onComplete, onRestart, difficulty }) => {
  // UI State (for rendering text/colors)
  // NOTE: We do NOT use this to drive the Y position animation anymore to avoid re-renders.
  const [activeWords, setActiveWords] = useState<ActiveWord[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [laser, setLaser] = useState<{x: number, y: number} | null>(null);
  
  // Visual Stats State (Throttled updates for performance)
  const [uiMetrics, setUiMetrics] = useState<GameMetrics & { timeSurvived: number }>({
    wordsDestroyed: 0,
    attempts: 0,
    mistakes: [],
    correctKeystrokes: 0,
    wordsPresented: 0,
    currentStreak: 0,
    longestStreak: 0,
    hardestWord: '-',
    maxWordDuration: 0,
    longestWordLen: 0,
    timeSurvived: 0
  });

  // Engine Refs (for logic loop - prevents stale closures)
  const wordsPoolRef = useRef<string[]>([]);
  const activeWordsRef = useRef<ActiveWord[]>([]);
  const targetedWordIdRef = useRef<string | null>(null);
  const wordElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Metrics Ref (Hot path data)
  const metricsRef = useRef<GameMetrics>({
    wordsDestroyed: 0,
    attempts: 0,
    mistakes: [],
    correctKeystrokes: 0,
    wordsPresented: 0,
    currentStreak: 0,
    longestStreak: 0,
    hardestWord: '-',
    maxWordDuration: 0,
    longestWordLen: 0
  });

  // Loop Control Refs
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const nextSpawnTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const wordsDestroyedRef = useRef<number>(0);
  const gameStateRef = useRef<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');

  // Initialize pool
  useEffect(() => {
    // Process text carefully to avoid empty strings
    const rawWords = originalText.trim().split(/\s+/);
    const pool = rawWords.filter(w => w.length > 0).sort(() => Math.random() - 0.5);
    
    wordsPoolRef.current = pool;
    // Reset refs on mount/restart
    wordsDestroyedRef.current = 0;
    activeWordsRef.current = [];
    targetedWordIdRef.current = null;
    gameStateRef.current = 'IDLE';
    
    // Clear DOM map
    wordElementsRef.current.clear();
    
    // Reset Metrics
    metricsRef.current = {
        wordsDestroyed: 0,
        attempts: 0,
        mistakes: [],
        correctKeystrokes: 0,
        wordsPresented: 0,
        currentStreak: 0,
        longestStreak: 0,
        hardestWord: '-',
        maxWordDuration: 0,
        longestWordLen: 0
    };

    setActiveWords([]);
    setGameState('IDLE');
    setUiMetrics({ ...metricsRef.current, timeSurvived: 0 });
  }, [originalText]);

  // UI Sync Loop (Updates HUD every 500ms to avoid React render spam)
  useEffect(() => {
    let interval: any;
    if (gameState === 'PLAYING') {
        interval = setInterval(() => {
            const now = Date.now();
            const timeSurvived = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;
            setUiMetrics({
                ...metricsRef.current,
                timeSurvived
            });
        }, 500);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Input Handler (Stable)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Ref for game state check to avoid dependency issues
      if (gameStateRef.current === 'PLAYING') {
        processInput(e.key);
      } else if (gameStateRef.current === 'IDLE' && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        startGame();
        processInput(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = stable listener

  const startGame = () => {
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    startTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
    wordsDestroyedRef.current = 0;
    activeWordsRef.current = [];
    targetedWordIdRef.current = null;
    
    // Initial spawn
    spawnWords(3);
    
    // Start loop
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnWords = (count: number) => {
    const currentActive = activeWordsRef.current;
    const newWords = [...currentActive];
    let poolIndex = wordsDestroyedRef.current + newWords.length;
    
    for (let i = 0; i < count; i++) {
      if (poolIndex >= wordsPoolRef.current.length) break;
      
      const text = wordsPoolRef.current[poolIndex];
      // Random X between 10% and 90%
      const x = 10 + Math.random() * 80;
      // Stagger Y slightly if spawning multiple to prevent overlaps
      const y = -10 - (i * 15); 
      
      // Speed scales with progress
      const speedMultiplier = 1 + (wordsDestroyedRef.current * 0.03);
      
      // Base Speed Calculation based on Difficulty
      let baseSpeed = 0;
      let variance = 0;

      switch (difficulty) {
        case 'BEGINNER':
          baseSpeed = 3; // 3% height per second
          variance = 2;  // up to 5%
          break;
        case 'HARD':
          baseSpeed = 12; // 12% height per second
          variance = 4;   // up to 16%
          break;
        case 'INTERMEDIATE':
        default:
          baseSpeed = 7; // 7% height per second
          variance = 3;  // up to 10%
          break;
      }

      const calculatedSpeed = (baseSpeed + Math.random() * variance) * speedMultiplier;
      
      newWords.push({
        id: `word-${poolIndex}-${Date.now()}-${Math.random()}`,
        text,
        x,
        y,
        speed: calculatedSpeed,
        completedChars: 0,
        isTargeted: false,
        spawnTime: Date.now()
      });
      
      poolIndex++;
      metricsRef.current.wordsPresented++; 
    }
    
    // Update ref AND state (Spawning needs re-render to create DOM nodes)
    activeWordsRef.current = newWords;
    setActiveWords(newWords);
  };

  const gameLoop = (time: number) => {
    if (gameStateRef.current !== 'PLAYING') return;

    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000; // seconds
    lastTimeRef.current = now;

    const currentWords = activeWordsRef.current;
    
    // 1. UPDATE POSITIONS (LOGIC)
    let nextWords = currentWords.map(w => ({
      ...w,
      y: w.y + (w.speed * deltaTime)
    }));

    // 2. APPLY DIRECT DOM MANIPULATION (VISUALS)
    // This is the key optimization: Move elements without React re-render
    nextWords.forEach(word => {
        const el = wordElementsRef.current.get(word.id);
        if (el) {
            // Convert % Y to Pixels for transform
            const pixelY = (word.y / 100) * GAME_HEIGHT;
            el.style.transform = `translate3d(-50%, ${pixelY}px, 0)`;
        }
    });

    // 3. CHECK LOGIC (Game Over / Spawning)
    const hitBottom = nextWords.some(w => w.y >= BOTTOM_THRESHOLD);
    if (hitBottom) {
      handleGameOver(false);
      return; 
    }

    // Spawn logic
    let shouldUpdateState = false;
    
    if (nextWords.length < 6 && wordsDestroyedRef.current + nextWords.length < wordsPoolRef.current.length) {
       if (now > nextSpawnTimeRef.current) {
          spawnWords(1);
          // Re-fetch because spawnWords updated refs/state
          nextWords = activeWordsRef.current;
          nextSpawnTimeRef.current = now + (SPAWN_INTERVAL_MS - (wordsDestroyedRef.current * 10));
          // spawnWords already handled state update
       }
    } else if (nextWords.length === 0 && wordsDestroyedRef.current >= wordsPoolRef.current.length) {
      handleGameOver(true);
      return;
    }

    // Update Refs for next frame
    activeWordsRef.current = nextWords;
    
    // NOTE: We do NOT call setActiveWords(nextWords) here. 
    // We rely on the DOM manipulation loop for movement.
    // React state is only updated on Spawn, Typing, or Destruction.

    if (gameStateRef.current === 'PLAYING') {
        requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const processInput = (key: string) => {
    // Filter non-char keys
    if (key.length !== 1) return;

    metricsRef.current.attempts++; 

    const currentActive = activeWordsRef.current;
    const currentTargetId = targetedWordIdRef.current;
    
    let target: ActiveWord | undefined;

    // Check Logic
    let isCorrect = false;

    if (currentTargetId) {
      target = currentActive.find(w => w.id === currentTargetId);
      if (target) {
        const nextChar = target.text[target.completedChars];
        if (key.toLowerCase() === nextChar.toLowerCase()) {
          isCorrect = true;
          updateWordProgress(target.id, target.completedChars + 1);
        }
      }
    } else {
      // Find new target
      // Prioritize words matching key, then closest to bottom
      const candidates = currentActive
        .filter(w => w.text[0].toLowerCase() === key.toLowerCase())
        .sort((a, b) => b.y - a.y); // Descending Y (closest to bottom first)

      if (candidates.length > 0) {
        isCorrect = true;
        const newTarget = candidates[0];
        targetedWordIdRef.current = newTarget.id;
        updateWordProgress(newTarget.id, 1);
      }
    }

    if (isCorrect) {
        metricsRef.current.correctKeystrokes++;
        metricsRef.current.currentStreak++;
        if (metricsRef.current.currentStreak > metricsRef.current.longestStreak) {
            metricsRef.current.longestStreak = metricsRef.current.currentStreak;
        }
    } else {
        metricsRef.current.mistakes.push(key);
        metricsRef.current.currentStreak = 0;
    }
  };

  const updateWordProgress = (id: string, newProgress: number) => {
    let wordDestroyed = false;
    let destroyedCoords = { x: 0, y: 0 };
    
    // We must update BOTH Ref (for physics) and State (for color/visuals)
    const updatedWords = activeWordsRef.current.map(w => {
      if (w.id === id) {
        if (newProgress >= w.text.length) {
          wordDestroyed = true;
          destroyedCoords = { x: w.x, y: w.y };
          
          const duration = Date.now() - w.spawnTime;
          if (duration > metricsRef.current.maxWordDuration) {
              metricsRef.current.maxWordDuration = duration;
              metricsRef.current.hardestWord = w.text;
          }
          if (w.text.length > metricsRef.current.longestWordLen) {
              metricsRef.current.longestWordLen = w.text.length;
          }
          
          return null; // Remove from list
        }
        return { ...w, completedChars: newProgress, isTargeted: true };
      }
      return { ...w, isTargeted: false };
    }).filter(Boolean) as ActiveWord[];

    activeWordsRef.current = updatedWords;
    setActiveWords(updatedWords); // Trigger Render for typing progress

    if (wordDestroyed) {
      targetedWordIdRef.current = null;
      wordsDestroyedRef.current += 1;
      metricsRef.current.wordsDestroyed++;
      
      // Fire Laser Visual
      setLaser(destroyedCoords);
      setTimeout(() => setLaser(null), 150);
    }
  };

  const handleGameOver = useCallback((won: boolean) => {
    setGameState(won ? 'WON' : 'LOST');
    gameStateRef.current = won ? 'WON' : 'LOST';
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    const duration = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;
    const typedTextStub = won ? originalText : originalText.substring(0, Math.floor(originalText.length / 2)); 
    
    setTimeout(() => {
        onComplete(typedTextStub, duration);
    }, 2000);
  }, [originalText, onComplete]);


  // Clean up
  useEffect(() => {
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Store Ref helper
  const setWordRef = (id: string, el: HTMLDivElement | null) => {
      if (el) {
          wordElementsRef.current.set(id, el);
          // Force initial position immediately to prevent jump
          const word = activeWordsRef.current.find(w => w.id === id);
          if (word) {
             const pixelY = (word.y / 100) * GAME_HEIGHT;
             el.style.transform = `translate3d(-50%, ${pixelY}px, 0)`;
          }
      } else {
          wordElementsRef.current.delete(id);
      }
  };

  // Metrics Calcs
  const accuracy = uiMetrics.wordsPresented > 0 
    ? Math.round((uiMetrics.wordsDestroyed / uiMetrics.wordsPresented) * 100) 
    : 100;
  const strikeRate = uiMetrics.attempts > 0
    ? Math.round((uiMetrics.correctKeystrokes / uiMetrics.attempts) * 100)
    : 100;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center relative">
      
      {/* HUD Bar */}
      <div className="relative rounded-3xl w-full mb-4">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative z-10 w-full flex justify-between items-center px-6 py-3 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-indigo-900/50 rounded-lg">
                    <Crosshair className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-white font-bold">Word Shooter</h2>
                    <p className="text-xs text-slate-400">Destroy 100 Words ({difficulty})</p>
                </div>
            </div>
            <div className="text-right relative z-10">
                <div className="text-3xl font-mono font-bold text-white tabular-nums">
                    {uiMetrics.wordsDestroyed} <span className="text-sm text-slate-500 text-base font-sans">/ {wordsPoolRef.current.length || 100}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative rounded-3xl w-full">
         <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
         <div 
            className="relative z-10 w-full cursor-crosshair bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl"
            style={{ height: GAME_HEIGHT }}
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
                backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', 
                backgroundSize: '30px 30px' 
            }}></div>

            {/* METRICS DASHBOARD */}
            {gameState === 'PLAYING' && (
                <div className="absolute top-4 right-4 z-30 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-lg w-64 animate-fade-in pointer-events-none">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-indigo-400" /> Live Metrics
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-xs">Time Survived</span>
                            <span className="text-white font-mono text-sm">{uiMetrics.timeSurvived.toFixed(1)}s</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-800/50 p-2 rounded">
                                <div className="text-[10px] text-slate-500 uppercase">Accuracy</div>
                                <div className={`font-mono text-sm font-bold ${accuracy < 50 ? 'text-red-400' : 'text-green-400'}`}>
                                    {accuracy}%
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-2 rounded">
                                <div className="text-[10px] text-slate-500 uppercase">Strike Rate</div>
                                <div className="font-mono text-sm font-bold text-blue-400">
                                    {strikeRate}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Start Overlay */}
            {gameState === 'IDLE' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                    <div className="text-center animate-bounce-subtle">
                        <Target className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white">Ready?</h3>
                        <p className="text-slate-400 mt-2">Type any falling word to start shooting.</p>
                    </div>
                </div>
            )}

            {/* End Overlays */}
            {gameState === 'WON' && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-950/90 z-50 animate-fade-in">
                    <div className="text-center">
                        <Trophy className="w-20 h-20 text-green-400 mx-auto mb-4" />
                        <h2 className="text-5xl font-bold text-white mb-2">VICTORY</h2>
                        <p className="text-green-200">Sector Secured. All targets eliminated.</p>
                    </div>
                </div>
            )}
            {gameState === 'LOST' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 z-50 animate-fade-in">
                    <div className="text-center">
                        <Skull className="w-20 h-20 text-red-500 mx-auto mb-4" />
                        <h2 className="text-5xl font-bold text-white mb-2">BREACHED</h2>
                        <p className="text-red-200">Enemy reached the perimeter.</p>
                    </div>
                </div>
            )}

            {/* Words */}
            {activeWords.map((word) => (
                <div 
                    key={word.id}
                    ref={(el) => setWordRef(word.id, el)}
                    className="absolute transform -translate-x-1/2 will-change-transform"
                    style={{ 
                        left: `${word.x}%`, 
                        top: 0, // IMPORTANT: Top is static, transform handles movement
                        zIndex: word.id === targetedWordIdRef.current ? 40 : 35,
                        // Initial position fallback to prevent Flash of Unpositioned Content before JS loop hits
                        transform: `translate3d(-50%, ${(word.y / 100) * GAME_HEIGHT}px, 0)`
                    }}
                >
                    <div className={`
                        px-3 py-1 rounded-full font-mono text-lg font-bold shadow-lg transition-colors duration-100
                        ${word.id === targetedWordIdRef.current ? 'bg-indigo-600 text-white scale-110 ring-4 ring-indigo-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}
                    `}>
                        <span className="text-indigo-300 opacity-50">{word.text.substring(0, word.completedChars)}</span>
                        <span className={word.id === targetedWordIdRef.current ? 'text-white' : ''}>{word.text.substring(word.completedChars)}</span>
                    </div>
                    {/* Connecting Line if targeted */}
                    {word.id === targetedWordIdRef.current && (
                        <div className="absolute left-1/2 top-full w-px h-[1000px] bg-indigo-500/20 -translate-x-1/2 pointer-events-none origin-top"></div>
                    )}
                </div>
            ))}

            {/* Laser Beam Visual */}
            {laser && (
                <svg className="absolute inset-0 pointer-events-none z-10" width="100%" height="100%">
                    <line 
                        x1="50%" y1="90%" 
                        x2={`${laser.x}%`} y2={`${laser.y}%`} 
                        stroke="#818cf8" 
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="animate-laser-fade"
                    />
                    <circle cx={`${laser.x}%`} cy={`${laser.y}%`} r="15" fill="white" className="animate-ping" />
                </svg>
            )}

            {/* Stickman Turret - Z-Index 20 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="relative w-16 h-24">
                    <svg viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        <circle cx="12" cy="6" r="4" fill="#1e1b4b" />
                        <path d="M12 10v14" />
                        <path d="M12 24l-6 10" />
                        <path d="M12 24l6 10" />
                        <path d="M12 14l-4 6" />
                        <path d="M12 14l4 6" />
                        <rect x="10" y="8" width="4" height="12" fill="#4f46e5" stroke="none" />
                    </svg>
                    {/* Muzzle Flash placeholder */}
                    {laser && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-8 h-8 bg-indigo-400 rounded-full blur-md opacity-80 animate-ping"></div>
                    )}
                </div>
            </div>
            
            {/* Danger Line */}
            <div className="absolute left-0 right-0 h-1 bg-red-500/30 z-10" style={{ top: `${BOTTOM_THRESHOLD}%` }}></div>
            <div className="absolute left-0 right-0 top-[86%] text-center text-[10px] text-red-500/50 uppercase tracking-[0.5em] font-bold z-10">Defense Line</div>
            
            {/* Base Platform */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>

        </div>
      </div>

      <style>{`
        @keyframes laser-fade {
            0% { opacity: 1; stroke-width: 6; }
            100% { opacity: 0; stroke-width: 0; }
        }
        .animate-laser-fade {
            animation: laser-fade 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ShooterGame;
