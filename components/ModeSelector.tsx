
import React, { useState } from 'react';
import { DifficultyMode, GameType } from '../types';
import { ArrowRight, ChevronLeft, Info } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';
import { ParticleTextEffect } from './ui/particle-text-effect';

interface ModeSelectorProps {
  onStart: (difficulty: DifficultyMode, gameType: GameType) => void;
}

const PremiumIcon = ({ name, className = "w-8 h-8" }: { name: string; className?: string }) => {
  const commonClasses = `drop-shadow-2xl ${className}`;
  
  switch (name) {
    case 'beginner':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
             <linearGradient id="g-leaf" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#22c55e" />
             </linearGradient>
             <filter id="blur-leaf">
                <feGaussianBlur stdDeviation="1.5" />
             </filter>
           </defs>
           {/* Soft glow behind */}
           <path d="M32 56C44 56 54 44 54 32C54 18 42 10 32 8C22 10 10 18 10 32C10 44 20 56 32 56Z" fill="#22c55e" opacity="0.2" filter="url(#blur-leaf)" />
           
           {/* Main Feather Shape */}
           <path d="M32 56C44 56 54 44 54 32C54 18 42 10 32 8C22 10 10 18 10 32C10 44 20 56 32 56Z" fill="url(#g-leaf)" />
           {/* Detail Vein */}
           <path d="M32 8V56" stroke="#14532d" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
           <path d="M32 20L42 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
           <path d="M32 32L44 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
           <path d="M32 20L22 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
           <path d="M32 32L20 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      );
    case 'intermediate':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
             <linearGradient id="g-bolt" x1="32" y1="5" x2="32" y2="59">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#0891b2" />
             </linearGradient>
             <filter id="glow-bolt">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
             </filter>
           </defs>
           <circle cx="32" cy="32" r="28" fill="#155e75" opacity="0.2" />
           <path d="M34 4L8 36H30L26 60L56 26H32L34 4Z" fill="url(#g-bolt)" stroke="#cffafe" strokeWidth="2" filter="url(#glow-bolt)" />
        </svg>
      );
    case 'hard':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
             <radialGradient id="g-fire-core" cx="32" cy="40" r="20" fx="32" fy="40">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#be123c" />
             </radialGradient>
           </defs>
           <circle cx="32" cy="35" r="25" fill="#9f1239" opacity="0.2" filter="blur(5px)" />
           <path d="M32 60C42 60 48 50 48 38C48 25 40 18 36 6C34 14 30 18 26 22C22 26 16 30 16 38C16 50 22 60 32 60Z" fill="url(#g-fire-core)" stroke="#fecdd3" strokeWidth="1" />
           <path d="M32 52C36 52 38 48 38 44C38 38 35 36 34 32C33 34 32 35 31 36C30 37 28 39 28 44C28 48 30 52 32 52Z" fill="#fff" opacity="0.6" />
        </svg>
      );
    case 'standard':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <linearGradient id="g-key" x1="0" y1="0" x2="0" y2="64">
                 <stop offset="0%" stopColor="#6366f1" />
                 <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
              <linearGradient id="g-key-face" x1="0" y1="0" x2="0" y2="64">
                 <stop offset="0%" stopColor="#818cf8" />
                 <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
           </defs>
           {/* Key Base */}
           <rect x="8" y="16" width="48" height="40" rx="8" fill="url(#g-key)" stroke="#312e81" strokeWidth="2" />
           {/* Key Face */}
           <rect x="12" y="12" width="40" height="36" rx="6" fill="url(#g-key-face)" stroke="#a5b4fc" strokeWidth="1" />
           {/* Letter A */}
           <text x="32" y="38" fontSize="24" fontFamily="monospace" fontWeight="bold" fill="white" textAnchor="middle">Aa</text>
        </svg>
      );
    case 'flood':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <linearGradient id="g-river-body" x1="0" y1="0" x2="0" y2="64">
                 <stop offset="0%" stopColor="#60a5fa" />
                 <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <filter id="f-glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
           </defs>
           {/* River Flow Path */}
           <path d="M12 16 C 24 8, 40 8, 52 16 L 52 48 C 40 40, 24 40, 12 48 Z" fill="url(#g-river-body)" stroke="#93c5fd" strokeWidth="2" filter="url(#f-glow-blue)" />
           
           {/* Wave Lines */}
           <path d="M18 24 C 28 18, 36 18, 46 24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
           <path d="M18 32 C 28 26, 36 26, 46 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
           <path d="M18 40 C 28 34, 36 34, 46 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        </svg>
      );
    case 'bomb':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <radialGradient id="g-bomb" cx="28" cy="24" r="28">
                 <stop offset="0%" stopColor="#555" />
                 <stop offset="100%" stopColor="#000" />
              </radialGradient>
           </defs>
           <circle cx="32" cy="36" r="24" fill="url(#g-bomb)" stroke="#333" strokeWidth="1" />
           {/* Highlight */}
           <circle cx="22" cy="26" r="6" fill="white" opacity="0.2" />
           {/* Fuse */}
           <path d="M32 12V6" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
           <path d="M32 6C38 6 42 2 46 4" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />
           {/* Spark */}
           <circle cx="46" cy="4" r="3" fill="#ef4444" className="animate-ping" />
           <circle cx="46" cy="4" r="2" fill="#fcd34d" />
        </svg>
      );
    case 'shooter':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <linearGradient id="g-gun-metal" x1="0" y1="0" x2="64" y2="64">
                 <stop offset="0%" stopColor="#a78bfa" />
                 <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
           </defs>
           {/* Gun Body */}
           <path d="M10 42 L 10 28 L 22 28 L 26 22 H 54 V 34 H 34 L 30 42 H 10 Z" fill="url(#g-gun-metal)" stroke="#5b21b6" strokeWidth="2" />
           {/* Grip lines */}
           <path d="M14 32 H 20" stroke="#4c1d95" strokeWidth="2" />
           <path d="M14 38 H 20" stroke="#4c1d95" strokeWidth="2" />
           {/* Bullets firing */}
           <rect x="58" y="24" width="8" height="4" rx="1" fill="#fbbf24" className="animate-pulse" />
           <rect x="68" y="24" width="8" height="4" rx="1" fill="#fbbf24" opacity="0.6" />
        </svg>
      );
    case 'drift':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <linearGradient id="g-racer" x1="32" y1="10" x2="32" y2="54">
                 <stop offset="0%" stopColor="#f97316" />
                 <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
           </defs>
           {/* Top Down Car */}
           <path d="M22 54 L 22 42 Q 20 30, 24 20 L 28 10 H 36 L 40 20 Q 44 30, 42 42 L 42 54 H 22 Z" fill="url(#g-racer)" stroke="#7c2d12" strokeWidth="1" />
           {/* Windshield */}
           <path d="M26 36 L 28 24 H 36 L 38 36 Q 32 34, 26 36 Z" fill="#1e293b" stroke="#7c2d12" strokeWidth="1" />
           {/* Spoiler */}
           <rect x="20" y="50" width="24" height="4" rx="1" fill="#7c2d12" />
           {/* Headlights */}
           <rect x="24" y="10" width="4" height="2" fill="#fef08a" />
           <rect x="36" y="10" width="4" height="2" fill="#fef08a" />
        </svg>
      );
    default:
      return null;
  }
};

const GameModeTooltip = ({ text }: { text: string }) => (
  <div className="absolute top-4 right-4 z-50 group/tooltip" onClick={(e) => e.stopPropagation()}>
    <div className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 backdrop-blur-sm cursor-help">
      <Info className="w-4 h-4 text-zinc-500 hover:text-zinc-200 transition-colors" />
    </div>
    <div className="absolute bottom-full right-0 mb-3 w-56 p-4 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 text-xs text-zinc-300 rounded-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 translate-y-2 group-hover/tooltip:translate-y-0 shadow-2xl z-50 text-left leading-relaxed">
      <div className="font-semibold text-white mb-1">How to Play</div>
      {text}
      <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-zinc-950 border-r border-b border-zinc-800 rotate-45"></div>
    </div>
  </div>
);

const ModeSelector: React.FC<ModeSelectorProps> = ({ onStart }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyMode | null>(null);

  const handleDifficultySelect = (diff: DifficultyMode) => {
    setSelectedDifficulty(diff);
    setStep(2);
  };

  const handleGameSelect = (game: GameType) => {
    if (selectedDifficulty) {
      onStart(selectedDifficulty, game);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedDifficulty(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fade-in-up pb-20">
      <div className="text-center mb-12 mt-8">
        {step === 1 ? (
            <div className="w-full h-[150px] md:h-[200px] flex items-center justify-center">
                <ParticleTextEffect 
                    words={["SwiftFingers", "WHERE FINGERS BECOME SWIFT"]} 
                    colors={[
                        { r: 45, g: 212, b: 191 },  // Teal (Primary)
                        { r: 255, g: 255, b: 255 }, // White
                        { r: 139, g: 92, b: 246 },  // Violet (Shooter)
                        { r: 244, g: 63, b: 94 },   // Rose (Hard)
                        { r: 251, g: 191, b: 36 }   // Amber (Bomb)
                    ]}
                />
            </div>
        ) : (
            <>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Choose Your <span className="text-primary-400">Game</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    {`You selected ${selectedDifficulty} level. Now pick a challenge.`}
                </p>
            </>
        )}
      </div>

      {step === 2 && (
        <button 
          onClick={handleBack}
          className="mb-6 flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Difficulty
        </button>
      )}

      <div className={step === 1 ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "grid grid-cols-1 md:grid-cols-3 gap-6"}>
        {step === 1 ? (
          <>
            {/* Beginner */}
            <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleDifficultySelect('BEGINNER')}>
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full p-8 text-left transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-16 h-16 bg-emerald-950/30 rounded-2xl flex items-center justify-center mb-6 border border-emerald-900/50 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-900/20">
                            <PremiumIcon name="beginner" className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">Beginner</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Simple words, short sentences. Focus on finger placement.
                        </p>
                        <div className="flex items-center text-emerald-400 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Select Level</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Intermediate */}
            <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleDifficultySelect('INTERMEDIATE')}>
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full p-8 text-left transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-16 h-16 bg-teal-950/30 rounded-2xl flex items-center justify-center mb-6 border border-teal-900/50 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-900/20">
                            <PremiumIcon name="intermediate" className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">Intermediate</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Natural paragraphs. The perfect balance for daily improvement.
                        </p>
                        <div className="flex items-center text-primary-400 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Select Level</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Hard */}
            <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleDifficultySelect('HARD')}>
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full p-8 text-left transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-16 h-16 bg-rose-950/30 rounded-2xl flex items-center justify-center mb-6 border border-rose-900/50 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-900/20">
                            <PremiumIcon name="hard" className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">Hard</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            Complex vocabulary and advanced punctuation. For experts only.
                        </p>
                        <div className="flex items-center text-rose-400 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Select Level</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
          </>
        ) : (
          <>
            {/* Standard Practice */}
            <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleGameSelect('STANDARD')}>
                <GameModeTooltip text="Type the generated paragraph accurately. Correct mistakes to proceed. Aim for high WPM and Accuracy." />
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-20 h-20 bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-800/50 shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-900/20">
                            <PremiumIcon name="standard" className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">Standard Practice</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 px-4">
                            Classic typing. Focus on accuracy and rhythm.
                        </p>
                        <div className="flex items-center text-indigo-400 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Start Practice</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Flood Escape */}
            <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleGameSelect('FLOOD_ESCAPE')}>
                <GameModeTooltip text="The water level rises over 60 seconds. Type correctly to float on top. Don't hit the ceiling spikes!" />
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-20 h-20 bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-800/50 shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/20">
                            <PremiumIcon name="flood" className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Flood Escape</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 px-4">
                            Survival mode! Type to float above rising water.
                        </p>
                        <div className="flex items-center text-blue-400 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Enter Game</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bomb Defuse */}
            <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleGameSelect('BOMB_DEFUSE')}>
                <GameModeTooltip text="Type the codes exactly as shown. A single typo triggers an instant explosion. Speed is key." />
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-20 h-20 bg-amber-900/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-800/50 shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-amber-900/20">
                            <PremiumIcon name="bomb" className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">Bomb Defuse</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 px-4">
                            One mistake = Detonation. Type perfect codes.
                        </p>
                        <div className="flex items-center text-amber-500 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Enter Game</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

             {/* Stickman Shooter */}
             <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleGameSelect('STICKMAN_SHOOTER')}>
                <GameModeTooltip text="Words fall from the sky. Type the first letter to target, then type the word to shoot. Don't let them land." />
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-20 h-20 bg-violet-900/20 rounded-2xl flex items-center justify-center mb-6 border border-violet-800/50 shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-violet-900/20">
                            <PremiumIcon name="shooter" className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">Word Shooter</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 px-4">
                            Arcade Action. Shoot falling words before they breach.
                        </p>
                        <div className="flex items-center text-violet-500 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Enter Game</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Drift Racing */}
            <div className="relative rounded-3xl cursor-pointer h-full group" onClick={() => handleGameSelect('DRIFT_RACING')}>
                <GameModeTooltip text="Words appear on lanes. Type the word to steer the car. Chain correct words for Nitro boosts!" />
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl z-10 overflow-hidden">
                    <div className="relative h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl">
                        <div className="w-20 h-20 bg-orange-900/20 rounded-2xl flex items-center justify-center mb-6 border border-orange-800/50 shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-orange-900/20">
                            <PremiumIcon name="drift" className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">Drift Racing</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 px-4">
                            Steer with words. Quick decisions. Nitro boosts.
                        </p>
                        <div className="flex items-center text-orange-500 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity mt-auto">
                            <span>Enter Game</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModeSelector;
