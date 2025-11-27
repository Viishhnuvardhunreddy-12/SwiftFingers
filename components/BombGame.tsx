
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, AlertTriangle, Bomb, CheckCircle } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

interface BombGameProps {
  originalText: string;
  onComplete: (typedText: string, timeTaken: number) => void;
  onRestart: () => void;
}

const BombGame: React.FC<BombGameProps> = ({ originalText, onComplete, onRestart }) => {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'DEFUSED' | 'EXPLODED'>('IDLE');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initialize words
  useEffect(() => {
    setWords(originalText.split(' '));
  }, [originalText]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0 && gameState === 'PLAYING') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleGameOver(false); // Time run out
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, gameState]);

  const handleGameOver = useCallback((won: boolean) => {
    setGameState(won ? 'DEFUSED' : 'EXPLODED');
    setIsActive(false);
    
    const duration = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 60;
    
    // Delay submission to show effect
    setTimeout(() => {
        // Construct full text from input so logic downstream works
        onComplete(input, Math.min(duration, 60));
    }, 2000);
  }, [input, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState === 'DEFUSED' || gameState === 'EXPLODED') return;

    const val = e.target.value;
    
    // Start game on first keystroke
    if (!isActive && gameState === 'IDLE') {
      setIsActive(true);
      setGameState('PLAYING');
      startTimeRef.current = Date.now();
    }

    // STRICT VALIDATION LOGIC
    // We compare what the user has typed TOTAL against the TOTAL original string
    // But we need to handle spaces correctly. 
    
    // Actually, simpler approach for "Instant Death":
    // Compare 'val' (current total input) against 'originalText.substring(0, val.length)'
    // If mismatch at any index -> BOOM.
    
    const expectedSubstr = originalText.substring(0, val.length);
    if (val !== expectedSubstr) {
        // Mismatch found!
        setInput(val); // Update input so they see the error
        handleGameOver(false); // EXPLODE
        return;
    }

    // If matches, update input
    setInput(val);

    // Check if word completed (space pressed or end of string)
    // We calculate current word index based on space count
    const spaceCount = (val.match(/ /g) || []).length;
    setCurrentWordIndex(spaceCount);

    // Check for win (Full text matches)
    if (val === originalText) {
        handleGameOver(true);
    }
  };

  const renderActiveWord = () => {
    if (words.length === 0) return null;
    const activeWord = words[currentWordIndex];
    if (!activeWord && gameState === 'DEFUSED') return "SEQUENCE COMPLETE";
    return activeWord;
  };

  return (
    <div 
        className={`w-full max-w-5xl mx-auto p-8 flex flex-col items-center justify-center min-h-[600px] transition-colors duration-300 ${gameState === 'EXPLODED' ? 'bg-red-950/50 animate-shake' : ''}`}
        onClick={() => inputRef.current?.focus()}
    >
      
      {/* Game Header */}
      <div className="relative rounded-3xl mb-12 w-full max-w-2xl">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative z-10 flex items-center justify-between w-full p-4 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-3 relative z-10">
                <div className={`p-2 rounded-lg ${gameState === 'EXPLODED' ? 'bg-red-500' : 'bg-amber-500/20'}`}>
                    <Bomb className={`w-6 h-6 ${gameState === 'EXPLODED' ? 'text-white' : 'text-amber-500'}`} />
                </div>
                <div>
                    <h2 className="text-white font-bold tracking-wider">BOMB DEFUSAL</h2>
                    <p className="text-xs text-slate-400 uppercase">One mistake = Detonation</p>
                </div>
            </div>
            
            {/* Digital Clock */}
            <div className="flex flex-col items-end relative z-10">
                <div className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1">Time Remaining</div>
                <div className="font-mono text-4xl font-black text-red-500 tabular-nums leading-none tracking-tight shadow-red-500/20 drop-shadow-lg">
                    00:{Math.floor(timeLeft).toString().padStart(2, '0')}:{Math.floor((timeLeft % 1) * 100).toString().padStart(2, '0')}
                </div>
            </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="relative w-full max-w-3xl flex flex-col items-center gap-8">
        
        {/* Progress Bars/Wires */}
        <div className="w-full flex gap-1 h-2 mb-4">
            {words.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`flex-1 rounded-full transition-all duration-300 ${
                        idx < currentWordIndex ? 'bg-green-500' : 
                        idx === currentWordIndex ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'
                    }`}
                ></div>
            ))}
        </div>

        {/* The Current Code Display */}
        <div className="relative">
             <div className={`text-6xl md:text-8xl font-mono font-black tracking-widest transition-all duration-200 ${
                 gameState === 'EXPLODED' ? 'text-red-500 blur-sm scale-110' : 
                 gameState === 'DEFUSED' ? 'text-green-500' : 'text-white'
             }`}>
                {gameState === 'DEFUSED' ? "SUCCESS" : 
                 gameState === 'EXPLODED' ? "FAILURE" : 
                 renderActiveWord()}
             </div>
             
             {/* Subtext */}
             <div className="text-center mt-4 h-6">
                {gameState === 'PLAYING' && (
                    <p className="text-amber-500/80 font-mono text-sm animate-pulse uppercase tracking-[0.3em]">
                        Input Sequence Required
                    </p>
                )}
             </div>
        </div>

        {/* Input Feedback Visuals */}
        <div className="relative rounded-3xl w-full">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 w-full p-6 font-mono text-xl text-slate-400 min-h-[80px] break-all bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
                {/* Background Scanline */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 animate-scan pointer-events-none"></div>
                
                <div className="relative z-10">
                    {input || <span className="opacity-30 animate-pulse">Waiting for input...</span>}
                    <span className="inline-block w-3 h-6 bg-amber-500 ml-1 animate-blink align-middle"></span>
                </div>
            </div>
        </div>

        {/* Overlays */}
        {gameState === 'IDLE' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl z-20">
                <div className="text-center animate-bounce-subtle">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">WARNING: STRICT PROTOCOL</h3>
                    <p className="text-slate-400">Type exact characters. One error causes detonation.</p>
                    <p className="text-slate-500 text-sm mt-4">Start typing to begin...</p>
                </div>
            </div>
        )}

        {gameState === 'EXPLODED' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md rounded-xl animate-fade-in border-4 border-red-500">
                <Bomb className="w-24 h-24 text-red-500 mb-4 animate-bounce" />
                <h2 className="text-6xl font-black text-red-500 tracking-tighter mb-2">DETONATION</h2>
                <p className="text-red-200 font-mono">FATAL ERROR DETECTED AT: {words[currentWordIndex]}</p>
            </div>
        )}

        {gameState === 'DEFUSED' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-green-950/90 backdrop-blur-md rounded-xl animate-fade-in border-4 border-green-500">
                <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
                <h2 className="text-6xl font-black text-green-500 tracking-tighter mb-2">DEFUSED</h2>
                <p className="text-green-200 font-mono">ALL SYSTEMS SECURE</p>
            </div>
        )}

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
        .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
        }
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(500%); }
        }
      `}</style>
    </div>
  );
};

export default BombGame;
