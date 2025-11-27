
import React, { useState } from 'react';
import { DifficultyMode, GameType } from '../types';
import { Leaf, Zap, Flame, ArrowRight, Waves, Keyboard, ChevronLeft, Bomb, Crosshair, Flag } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';
import { ParticleTextEffect } from './ui/particle-text-effect';

interface ModeSelectorProps {
  onStart: (difficulty: DifficultyMode, gameType: GameType) => void;
}

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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full p-8 text-left transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-12 h-12 bg-emerald-950/50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-900 group-hover:scale-110 transition-transform duration-300">
                            <Leaf className="w-6 h-6 text-emerald-400" />
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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full p-8 text-left transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-6 h-6 text-primary-400" />
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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full p-8 text-left transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-12 h-12 bg-rose-950/50 rounded-2xl flex items-center justify-center mb-6 border border-rose-900 group-hover:scale-110 transition-transform duration-300">
                            <Flame className="w-6 h-6 text-rose-400" />
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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-16 h-16 bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 border border-indigo-800 shrink-0 group-hover:scale-110 transition-transform">
                            <Keyboard className="w-8 h-8 text-indigo-400" />
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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-16 h-16 bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 border border-blue-800 shrink-0 group-hover:scale-110 transition-transform">
                            <Waves className="w-8 h-8 text-blue-400" />
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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-16 h-16 bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6 border border-amber-800 shrink-0 group-hover:scale-110 transition-transform">
                            <Bomb className="w-8 h-8 text-amber-500" />
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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-16 h-16 bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6 border border-violet-800 shrink-0 group-hover:scale-110 transition-transform">
                            <Crosshair className="w-8 h-8 text-violet-400" />
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
                <div className="relative h-full bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-3xl shadow-xl">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                    <div className="relative z-10 h-full aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-slate-800/20 rounded-3xl overflow-hidden">
                        <div className="w-16 h-16 bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6 border border-orange-800 shrink-0 group-hover:scale-110 transition-transform">
                            <Flag className="w-8 h-8 text-orange-400" />
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
