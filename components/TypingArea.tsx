
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, RefreshCw, AlertCircle } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

interface TypingAreaProps {
  originalText: string;
  onComplete: (typedText: string, timeTaken: number) => void;
  onRestart: () => void;
  isSubmitting: boolean;
}

const TypingArea: React.FC<TypingAreaProps> = ({ originalText, onComplete, onRestart, isSubmitting }) => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Split original text into words for rendering
  useEffect(() => {
    setWords(originalText.split(' '));
  }, [originalText]);

  // Timer logic
  useEffect(() => {
    // Fixed: Use 'any' type for interval to avoid NodeJS namespace issues in browser environment
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                // Time is up!
                handleFinish();
                return 0;
            }
            return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle completion (either by time or text length)
  const handleFinish = useCallback(() => {
    setIsActive(false);
    const duration = startTime ? (Date.now() - startTime) / 1000 : 60;
    // Prevent double submission
    onComplete(input, Math.min(duration, 60));
  }, [input, startTime, onComplete]);

  // Check if text is completed manually
  useEffect(() => {
    if (input.length > 0 && input.length >= originalText.length) {
      handleFinish();
    }
  }, [input, originalText, handleFinish]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isActive && val.length === 1 && timeLeft > 0) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    setInput(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
     // Optional: block copy/paste if desired, but keeping it open for now
  };

  // Render text with highlighting
  const renderText = () => {
    const inputChars = input.split('');
    const originalChars = originalText.split('');
    
    return originalChars.map((char, index) => {
      let className = "text-slate-500"; // Default (future)
      
      if (index < inputChars.length) {
        if (inputChars[index] === char) {
          className = "text-primary-400"; // Correct
        } else {
          className = "text-red-500 bg-red-500/10"; // Incorrect
        }
      } else if (index === inputChars.length) {
        className = "text-slate-200 bg-primary-500/20 underline decoration-primary-500 decoration-2 underline-offset-4"; // Current cursor position
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  if (isSubmitting) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
            <div className="text-xl font-medium text-primary-400">Analyzing Performance...</div>
            <div className="text-slate-400 text-sm">Gemini is evaluating your speed and accuracy</div>
        </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2 text-primary-400">
            <Timer className="w-5 h-5" />
            <span className="text-2xl font-mono font-bold">{timeLeft}s</span>
        </div>
        <button 
            onClick={onRestart}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-medium uppercase tracking-wider"
        >
            <RefreshCw className="w-4 h-4" />
            <span>Restart</span>
        </button>
      </div>

      {/* Typing Container with Glowing Effect */}
      <div className="relative rounded-3xl p-1">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden p-0 shadow-2xl z-10">
            <div className="relative font-mono text-2xl leading-relaxed break-words p-8 min-h-[300px]" onClick={() => inputRef.current?.focus()}>
                
                {/* The Visual Text */}
                <div className="pointer-events-none whitespace-pre-wrap break-words">
                    {renderText()}
                </div>

                {/* Hidden Input for Logic */}
                <input
                ref={inputRef}
                type="text"
                className="absolute inset-0 opacity-0 cursor-default"
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                />

                {/* Overlay if not started */}
                {!isActive && input.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-2xl pointer-events-none">
                    <div className="text-slate-400 flex items-center space-x-2 animate-pulse">
                        <AlertCircle className="w-5 h-5" />
                        <span>Start typing to begin</span>
                    </div>
                </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center text-slate-500 text-sm">
        <p>Press <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">Tab</span> to restart quickly</p>
      </div>
    </div>
  );
};

export default TypingArea;
