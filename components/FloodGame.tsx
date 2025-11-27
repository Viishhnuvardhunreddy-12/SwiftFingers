
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Waves, Zap, Timer } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

interface FloodGameProps {
  originalText: string;
  onComplete: (typedText: string, timeTaken: number) => void;
  onRestart: () => void;
}

const FloodGame: React.FC<FloodGameProps> = ({ originalText, onComplete, onRestart }) => {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer & Water Logic
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0 && gameState === 'PLAYING') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            handleGameOver(false); // Time run out = Lost
            return 0;
          }
          return prev - 0.1; // Smoother updates for water
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, gameState]);

  const handleGameOver = useCallback((won: boolean) => {
    setGameState(won ? 'WON' : 'LOST');
    setIsActive(false);
    
    // Calculate final time
    const duration = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 60;
    
    // Small delay to show win/loss state before submitting
    setTimeout(() => {
        onComplete(input, Math.min(duration, 60));
    }, 1500);
  }, [input, onComplete]);

  // Check for completion
  useEffect(() => {
    if (input.length > 0 && input.length >= originalText.length) {
      handleGameOver(true);
    }
  }, [input, originalText, handleGameOver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isActive && gameState === 'IDLE') {
      setIsActive(true);
      setGameState('PLAYING');
      startTimeRef.current = Date.now();
    }
    setInput(val);
  };

  const renderText = () => {
    const inputChars = input.split('');
    const originalChars = originalText.split('');
    
    return originalChars.map((char, index) => {
      let className = "text-slate-500"; 
      
      if (index < inputChars.length) {
        if (inputChars[index] === char) {
          className = "text-blue-400"; // Highlight correct text in blue for water theme
        } else {
          className = "text-red-400 bg-red-900/20"; 
        }
      } else if (index === inputChars.length) {
        className = "text-blue-100 bg-blue-500/30 underline decoration-blue-400 decoration-2 underline-offset-4";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  // Water height percentage (inverted: 0s left = 100% height)
  const waterHeight = Math.min(100, Math.max(0, ((60 - timeLeft) / 60) * 100));
  
  // Danger levels based on how close to the CEILING (100%) they are
  const isWarning = waterHeight > 70;
  const isCritical = waterHeight > 90;

  return (
    <div 
        className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 lg:items-stretch min-h-[600px]" 
        onClick={() => inputRef.current?.focus()}
    >
      
      {/* LEFT PANEL: Typing Interface */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header */}
        <div className="relative rounded-2xl">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 flex justify-between items-center p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-blue-950 rounded-lg">
                        <Waves className="text-blue-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg">Flood Escape</h2>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Survival Mode</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-700 relative z-10">
                    <Timer className={`w-5 h-5 ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
                    <span className={`font-mono text-xl font-bold tabular-nums ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                        {Math.ceil(timeLeft)}s
                    </span>
                </div>
            </div>
        </div>

        {/* Typing Container */}
        <div className="relative rounded-3xl flex-1 flex flex-col">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 flex-1 p-8 md:p-12 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
                {/* Text Content */}
                <div className="relative z-10 w-full max-w-3xl">
                    <div className="font-mono text-xl md:text-2xl leading-relaxed break-words text-slate-500">
                        {renderText()}
                    </div>
                </div>

                {/* Start Prompt Overlay */}
                {!isActive && gameState === 'IDLE' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 transition-all duration-300">
                        <div className="text-center animate-bounce-subtle">
                            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <p className="text-white text-2xl font-bold">Start Typing to Begin</p>
                            <p className="text-slate-400 mt-2">The water is rising. Don't hit the ceiling!</p>
                        </div>
                    </div>
                )}

                {/* Game Over Overlays */}
                {gameState === 'WON' && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-green-950/90 backdrop-blur-md animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-5xl font-bold text-green-400 tracking-tighter mb-2">ESCAPED</h2>
                            <p className="text-green-100">You drained the tank in time.</p>
                        </div>
                    </div>
                )}
                {gameState === 'LOST' && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-950/90 backdrop-blur-md animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-5xl font-bold text-red-500 tracking-tighter mb-2">CRUSHED</h2>
                            <p className="text-red-100">The water pushed you into the spikes.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex justify-between items-center px-2">
             <p className="text-slate-500 text-sm">Type correctly to stop the water rising.</p>
             <button 
                onClick={(e) => { e.stopPropagation(); onRestart(); }}
                className="text-slate-400 hover:text-white text-sm font-medium uppercase tracking-wider hover:underline"
            >
                Exit Simulation
            </button>
        </div>
      </div>

      {/* RIGHT PANEL: The Tank Visual */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4">
           {/* The Glass Tank */}
           <div className="relative flex-1 bg-slate-950 rounded-2xl border-4 border-slate-700 overflow-hidden shadow-2xl ring-1 ring-slate-800 min-h-[500px]">
                
                {/* Visual Header: Ceiling Spikes */}
                <div className="absolute top-0 left-0 right-0 h-8 z-20 flex justify-between items-start px-1 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-6 h-8 bg-gradient-to-b from-red-500 to-transparent clip-path-spike opacity-80"></div>
                    ))}
                </div>
                {/* Hazard Warning at Top */}
                <div className="absolute top-2 w-full text-center z-20">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-500/50 rounded-full">
                        <Zap className="w-3 h-3 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-red-400 tracking-widest">HIGH VOLTAGE</span>
                     </div>
                </div>
                
                {/* Tank Glass Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none z-30 rounded-lg"></div>

                {/* Grid Background inside Tank */}
                <div className="absolute inset-0 opacity-20 z-0" style={{ 
                    backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}></div>

                {/* Level Markers */}
                <div className="absolute right-0 top-0 bottom-0 w-12 flex flex-col justify-between py-12 items-end px-2 z-0 opacity-40">
                    <span className="text-[10px] text-red-500 font-mono">100%</span>
                    <div className="w-full h-px bg-red-500/50"></div>
                    <span className="text-[10px] text-yellow-500 font-mono">50%</span>
                    <div className="w-full h-px bg-yellow-500/50"></div>
                    <span className="text-[10px] text-blue-500 font-mono">0%</span>
                    <div className="w-full h-px bg-blue-500/50"></div>
                </div>

                {/* The Character - Now FLOATING on top of water */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 z-40 transition-all duration-100 ease-linear"
                    style={{ bottom: `${waterHeight}%` }}
                >
                    <div className="flex flex-col items-center relative mb-[-5px]">
                        
                        {/* Speech Bubble - ALWAYS VISIBLE now */}
                        {gameState === 'PLAYING' && (
                             <div className={`absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl shadow-xl z-50 border-2 border-slate-200 transition-transform ${isWarning ? 'scale-110' : 'scale-100'}`}>
                                 {isCritical ? "TOO CLOSE!" : isWarning ? "WATCH OUT!" : "KEEP TYPING!"}
                                 <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200"></div>
                             </div>
                        )}

                        {/* Interactive Human SVG */}
                        <svg 
                            width="50" 
                            height="80" 
                            viewBox="0 0 24 48" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`transition-all duration-300 ${
                                isCritical ? 'text-red-500 animate-shake' : 
                                isWarning ? 'text-amber-400' : 'text-white drop-shadow-md'
                            }`}
                        >
                            {/* Head */}
                            <circle cx="12" cy="6" r="4" fill="currentColor" className="opacity-20" stroke="none" />
                            <circle cx="12" cy="6" r="4" />
                            
                            {/* Body */}
                            <path d="M12 10v14" />
                            
                            {/* Legs - Bent because sitting/balancing */}
                            <path d="M12 24l-4 8" />
                            <path d="M12 24l4 8" />

                            {/* Arms */}
                            <g className={`transition-all duration-500 origin-[12px_12px] ${isWarning ? '-translate-y-2' : ''}`}>
                                 {isWarning ? (
                                    // Hands up trying to push ceiling away
                                    <>
                                        <path d="M12 12l-6 -8" />
                                        <path d="M12 12l6 -8" />
                                    </>
                                 ) : (
                                    // Balancing arms
                                    <>
                                        <path d="M12 12l-6 4" />
                                        <path d="M12 12l6 4" />
                                    </>
                                 )}
                            </g>
                        </svg>

                        {/* Wooden Raft */}
                        <div className="w-20 h-3 bg-amber-700 rounded-sm shadow-lg border border-amber-900 relative">
                            <div className="absolute inset-x-2 top-0.5 h-px bg-amber-600/50"></div>
                            {/* Water splashes under raft */}
                            {gameState === 'PLAYING' && (
                                <>
                                    <div className="absolute -bottom-1 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-ping opacity-50"></div>
                                    <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-50 delay-100"></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rising Water Body */}
                <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500/80 transition-all duration-100 ease-linear border-t-4 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.6)] z-20 backdrop-blur-md"
                    style={{ height: `${waterHeight}%` }}
                >
                    {/* Bubbles */}
                    <div className="absolute inset-0 overflow-hidden opacity-40">
                        <div className="absolute bottom-0 left-1/4 w-3 h-3 bg-white/50 rounded-full animate-[rise_3s_infinite]"></div>
                        <div className="absolute bottom-10 left-3/4 w-4 h-4 bg-white/50 rounded-full animate-[rise_4s_infinite_0.5s]"></div>
                        <div className="absolute bottom-20 left-1/2 w-2 h-2 bg-white/50 rounded-full animate-[rise_2s_infinite_1s]"></div>
                    </div>
                </div>

           </div>
      </div>

      {/* Hidden Input */}
      <input
          ref={inputRef}
          type="text"
          className="absolute inset-0 opacity-0 cursor-default"
          value={input}
          onChange={handleChange}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

      <style>{`
        .clip-path-spike {
            clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
        @keyframes rise {
            0% { transform: translateY(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-200px); opacity: 0; }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
        }
        .animate-shake {
            animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) infinite;
        }
      `}</style>
    </div>
  );
};

export default FloodGame;
