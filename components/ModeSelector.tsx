
import React, { useState } from 'react';
import { DifficultyMode, GameType } from '../types';
import { ArrowRight, ChevronLeft, Info, X, Rocket } from 'lucide-react';
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
             <linearGradient id="g-sprout" x1="32" y1="10" x2="32" y2="54">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
             </linearGradient>
             <radialGradient id="g-sprout-glow" cx="32" cy="32" r="28">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
             </radialGradient>
           </defs>
           {/* Glow effect */}
           <circle cx="32" cy="32" r="28" fill="url(#g-sprout-glow)" />
           
           {/* Stem */}
           <path d="M32 54 Q32 40, 32 30" stroke="url(#g-sprout)" strokeWidth="4" strokeLinecap="round" fill="none" />
           
           {/* Left leaf */}
           <path d="M32 35 Q20 32, 18 28 Q18 26, 20 26 Q28 28, 32 32" fill="url(#g-sprout)" stroke="#15803d" strokeWidth="1" />
           
           {/* Right leaf */}
           <path d="M32 35 Q44 32, 46 28 Q46 26, 44 26 Q36 28, 32 32" fill="url(#g-sprout)" stroke="#15803d" strokeWidth="1" />
           
           {/* Top leaves */}
           <ellipse cx="26" cy="20" rx="8" ry="12" fill="url(#g-sprout)" stroke="#15803d" strokeWidth="1" transform="rotate(-20 26 20)" />
           <ellipse cx="38" cy="20" rx="8" ry="12" fill="url(#g-sprout)" stroke="#15803d" strokeWidth="1" transform="rotate(20 38 20)" />
           
           {/* Highlights */}
           <ellipse cx="24" cy="18" rx="3" ry="5" fill="white" opacity="0.4" transform="rotate(-20 24 18)" />
           <ellipse cx="40" cy="18" rx="3" ry="5" fill="white" opacity="0.4" transform="rotate(20 40 18)" />
        </svg>
      );
    case 'intermediate':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
             <linearGradient id="g-rocket" x1="32" y1="8" x2="32" y2="56">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
             </linearGradient>
             <radialGradient id="g-rocket-glow" cx="32" cy="32" r="28">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
             </radialGradient>
             <linearGradient id="g-flame" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
             </linearGradient>
           </defs>
           {/* Glow */}
           <circle cx="32" cy="32" r="28" fill="url(#g-rocket-glow)" />
           
           {/* Rocket body */}
           <path d="M32 8 L38 28 L38 42 L32 48 L26 42 L26 28 Z" fill="url(#g-rocket)" stroke="#0891b2" strokeWidth="2" />
           
           {/* Window */}
           <circle cx="32" cy="22" r="5" fill="#164e63" stroke="#67e8f9" strokeWidth="1.5" />
           <circle cx="32" cy="22" r="3" fill="#0891b2" opacity="0.6" />
           
           {/* Wings */}
           <path d="M26 32 L18 38 L18 44 L26 40 Z" fill="url(#g-rocket)" stroke="#0891b2" strokeWidth="1.5" />
           <path d="M38 32 L46 38 L46 44 L38 40 Z" fill="url(#g-rocket)" stroke="#0891b2" strokeWidth="1.5" />
           
           {/* Flame exhaust */}
           <path d="M28 48 Q26 52, 28 56 Q30 54, 32 56 Q34 54, 36 56 Q38 52, 36 48" fill="url(#g-flame)" opacity="0.8" />
           <path d="M30 50 Q31 52, 32 54 Q33 52, 34 50" fill="#fef08a" opacity="0.6" />
           
           {/* Highlights */}
           <path d="M30 12 L32 10 L34 12 L34 26 L30 26 Z" fill="white" opacity="0.2" />
        </svg>
      );
    case 'hard':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
             <radialGradient id="g-skull" cx="32" cy="28" r="24">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="50%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
             </radialGradient>
             <radialGradient id="g-skull-glow" cx="32" cy="32" r="28">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
             </radialGradient>
           </defs>
           {/* Glow */}
           <circle cx="32" cy="32" r="28" fill="url(#g-skull-glow)" />
           
           {/* Skull head */}
           <ellipse cx="32" cy="26" rx="18" ry="20" fill="url(#g-skull)" stroke="#991b1b" strokeWidth="2" />
           
           {/* Eye sockets */}
           <ellipse cx="24" cy="24" rx="5" ry="7" fill="#450a0a" />
           <ellipse cx="40" cy="24" rx="5" ry="7" fill="#450a0a" />
           
           {/* Eye glows */}
           <ellipse cx="24" cy="23" rx="2" ry="3" fill="#ef4444" opacity="0.8" />
           <ellipse cx="40" cy="23" rx="2" ry="3" fill="#ef4444" opacity="0.8" />
           
           {/* Nose cavity */}
           <path d="M32 30 L28 34 L32 36 L36 34 Z" fill="#450a0a" />
           
           {/* Teeth/jaw */}
           <path d="M20 38 L44 38 Q44 44, 40 46 L36 46 L36 42 L32 42 L32 46 L28 46 L28 42 L24 42 L24 46 Q20 44, 20 38 Z" fill="url(#g-skull)" stroke="#991b1b" strokeWidth="1.5" />
           
           {/* Teeth lines */}
           <line x1="28" y1="38" x2="28" y2="42" stroke="#450a0a" strokeWidth="1.5" />
           <line x1="32" y1="38" x2="32" y2="42" stroke="#450a0a" strokeWidth="1.5" />
           <line x1="36" y1="38" x2="36" y2="42" stroke="#450a0a" strokeWidth="1.5" />
           
           {/* Cracks */}
           <path d="M18 20 L16 18" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />
           <path d="M46 20 L48 18" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />
           
           {/* Highlight */}
           <ellipse cx="26" cy="18" rx="4" ry="6" fill="white" opacity="0.2" />
        </svg>
      );
    case 'standard':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <linearGradient id="g-pencil" x1="10" y1="10" x2="54" y2="54">
                 <stop offset="0%" stopColor="#818cf8" />
                 <stop offset="50%" stopColor="#6366f1" />
                 <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <radialGradient id="g-pencil-glow" cx="32" cy="32" r="28">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="g-wood" x1="0" y1="0" x2="1" y2="1">
                 <stop offset="0%" stopColor="#fbbf24" />
                 <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
           </defs>
           {/* Glow */}
           <circle cx="32" cy="32" r="28" fill="url(#g-pencil-glow)" />
           
           {/* Pencil body */}
           <path d="M12 52 L32 12 L52 32 L32 52 Z" fill="url(#g-pencil)" stroke="#4338ca" strokeWidth="2" />
           
           {/* Wood tip */}
           <path d="M32 12 L38 18 L32 24 L26 18 Z" fill="url(#g-wood)" stroke="#d97706" strokeWidth="1.5" />
           
           {/* Graphite tip */}
           <path d="M32 12 L35 15 L32 18 L29 15 Z" fill="#1f2937" stroke="#000" strokeWidth="1" />
           
           {/* Eraser */}
           <path d="M26 46 L32 52 L38 46 L38 42 L26 42 Z" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
           <rect x="26" y="40" width="12" height="3" fill="#94a3b8" />
           
           {/* Shine on pencil */}
           <path d="M28 20 L30 18 L44 32 L42 34 Z" fill="white" opacity="0.2" />
           
           {/* Text lines */}
           <path d="M20 38 L24 34" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
           <path d="M16 42 L20 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
           <path d="M12 46 L16 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        </svg>
      );
    case 'flood':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <linearGradient id="g-droplet" x1="32" y1="8" x2="32" y2="56">
                 <stop offset="0%" stopColor="#7dd3fc" />
                 <stop offset="50%" stopColor="#38bdf8" />
                 <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <radialGradient id="g-droplet-glow" cx="32" cy="32" r="28">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
              </radialGradient>
           </defs>
           {/* Glow */}
           <circle cx="32" cy="32" r="28" fill="url(#g-droplet-glow)" />
           
           {/* Water droplet */}
           <path d="M32 8 Q42 20, 48 32 Q48 48, 32 56 Q16 48, 16 32 Q22 20, 32 8 Z" fill="url(#g-droplet)" stroke="#0369a1" strokeWidth="2" />
           
           {/* Highlight */}
           <ellipse cx="26" cy="22" rx="6" ry="10" fill="white" opacity="0.4" />
           <ellipse cx="38" cy="28" rx="3" ry="5" fill="white" opacity="0.3" />
           
           {/* Inner shine */}
           <path d="M24 18 Q28 24, 26 32" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
           
           {/* Water waves at bottom */}
           <path d="M20 44 Q24 42, 28 44 Q32 46, 36 44 Q40 42, 44 44" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
           
           {/* Splash effect */}
           <circle cx="14" cy="50" r="2" fill="#38bdf8" opacity="0.6" />
           <circle cx="50" cy="50" r="2" fill="#38bdf8" opacity="0.6" />
           <circle cx="10" cy="44" r="1.5" fill="#7dd3fc" opacity="0.5" />
           <circle cx="54" cy="44" r="1.5" fill="#7dd3fc" opacity="0.5" />
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
              <linearGradient id="g-target" x1="32" y1="8" x2="32" y2="56">
                 <stop offset="0%" stopColor="#c084fc" />
                 <stop offset="50%" stopColor="#a855f7" />
                 <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
              <radialGradient id="g-target-glow" cx="32" cy="32" r="28">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
           </defs>
           {/* Glow */}
           <circle cx="32" cy="32" r="28" fill="url(#g-target-glow)" />
           
           {/* Target circles */}
           <circle cx="32" cy="32" r="24" fill="none" stroke="url(#g-target)" strokeWidth="3" />
           <circle cx="32" cy="32" r="18" fill="none" stroke="url(#g-target)" strokeWidth="2.5" />
           <circle cx="32" cy="32" r="12" fill="none" stroke="url(#g-target)" strokeWidth="2" />
           <circle cx="32" cy="32" r="6" fill="url(#g-target)" />
           
           {/* Crosshair */}
           <line x1="32" y1="8" x2="32" y2="20" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
           <line x1="32" y1="44" x2="32" y2="56" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
           <line x1="8" y1="32" x2="20" y2="32" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
           <line x1="44" y1="32" x2="56" y2="32" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
           
           {/* Bullet holes */}
           <circle cx="38" cy="20" r="2" fill="#581c87" />
           <circle cx="44" cy="28" r="1.5" fill="#581c87" />
           <circle cx="26" cy="42" r="2" fill="#581c87" />
           
           {/* Center dot */}
           <circle cx="32" cy="32" r="2" fill="white" />
        </svg>
      );
    case 'drift':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={commonClasses}>
           <defs>
              <linearGradient id="g-speedometer" x1="32" y1="12" x2="32" y2="52">
                 <stop offset="0%" stopColor="#fb923c" />
                 <stop offset="50%" stopColor="#f97316" />
                 <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
              <radialGradient id="g-speed-glow" cx="32" cy="32" r="28">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
           </defs>
           {/* Glow */}
           <circle cx="32" cy="32" r="28" fill="url(#g-speed-glow)" />
           
           {/* Speedometer outer ring */}
           <circle cx="32" cy="36" r="22" fill="none" stroke="url(#g-speedometer)" strokeWidth="4" />
           <circle cx="32" cy="36" r="18" fill="#1a1a1a" stroke="#7c2d12" strokeWidth="1" />
           
           {/* Speed marks */}
           <line x1="32" y1="14" x2="32" y2="20" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
           <line x1="48" y1="22" x2="44" y2="26" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
           <line x1="54" y1="36" x2="48" y2="36" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
           <line x1="16" y1="22" x2="20" y2="26" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
           <line x1="10" y1="36" x2="16" y2="36" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
           
           {/* Needle pointing to high speed */}
           <line x1="32" y1="36" x2="46" y2="26" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
           <circle cx="32" cy="36" r="3" fill="#ef4444" />
           
           {/* Speed lines (motion blur) */}
           <path d="M8 48 L18 48" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
           <path d="M6 52 L14 52" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
           <path d="M10 56 L16 56" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
           
           {/* Highlight */}
           <circle cx="28" cy="30" r="4" fill="white" opacity="0.2" />
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
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleDifficultySelect = (diff: DifficultyMode) => {
    setSelectedDifficulty(diff);
    setStep(2);
  };

  const handleGameSelect = (game: GameType) => {
    if (game === 'DRIFT_RACING') {
      setShowComingSoon(true);
      return;
    }
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

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          />
          {/* Card */}
          <div className="relative z-10 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-fade-in-up">
            {/* Close */}
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-orange-950/40 border border-orange-800/50 flex items-center justify-center">
              <Rocket className="w-10 h-10 text-orange-400" />
            </div>

            {/* Text */}
            <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide">
              UPCOMING UPDATE
            </div>
            <h3 className="text-2xl font-black text-white mt-3 mb-2">Drift Racing</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We&apos;re fine-tuning the engine. Drift Racing is coming in the next update with
              smoother controls, better visuals, and full leaderboard support.
            </p>

            {/* Features preview */}
            <div className="grid grid-cols-2 gap-2 mb-6 text-left">
              {['Animated road & trees', 'Nitro boost system', 'Global leaderboard', 'Multiplayer lanes'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
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
                {/* Coming Soon overlay badge */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/90 text-black text-[10px] font-black tracking-wider shadow-lg">
                  <Rocket className="w-3 h-3" />
                  COMING SOON
                </div>
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
