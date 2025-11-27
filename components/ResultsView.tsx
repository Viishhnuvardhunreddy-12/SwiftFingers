
import React from 'react';
import { EvaluationResult, MistakeAnalysis, GameType } from '../types';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import { CheckCircle2, XCircle, TrendingUp, RefreshCcw, Activity, Sparkles, BrainCircuit, ArrowRight, Target, Trophy, Skull, Bomb, ShieldCheck, Crosshair, Flag } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

interface ResultsViewProps {
  result: EvaluationResult;
  onRestart: () => void;
  onAnalyze: () => void;
  onStartRemedial: (text: string) => void;
  analysis: MistakeAnalysis | null;
  isAnalyzing: boolean;
  gameStatus?: 'WON' | 'LOST' | null;
  gameType?: GameType;
}

const ResultsView: React.FC<ResultsViewProps> = ({ 
    result, 
    onRestart, 
    onAnalyze, 
    onStartRemedial, 
    analysis, 
    isAnalyzing,
    gameStatus,
    gameType = 'STANDARD'
}) => {
  const chartData = [
    { name: 'WPM', uv: Math.min(result.wpm, 150), max: 150, fill: '#2dd4bf' },
    { name: 'Accuracy', uv: result.accuracy, max: 100, fill: '#818cf8' },
    { name: 'Score', uv: result.score, max: 100, fill: '#f472b6' },
  ];

  const style = {
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    lineHeight: '24px',
  };

  const getGameText = () => {
    if (gameType === 'BOMB_DEFUSE') {
        return {
            wonTitle: 'BOMB DEFUSED',
            wonDesc: 'Wire sequence entered correctly. The area is secure.',
            wonBadge: 'SECURE',
            lostTitle: 'DETONATION',
            lostDesc: 'A mistake triggered the mechanism. Precision is key.',
            lostBadge: 'BOOM'
        };
    } else if (gameType === 'STICKMAN_SHOOTER') {
        return {
            wonTitle: 'SECTOR SECURED',
            wonDesc: 'All targets neutralized. Space is safe again.',
            wonBadge: 'VICTORY',
            lostTitle: 'DEFENSE BREACHED',
            lostDesc: 'The enemies overwhelmed the perimeter.',
            lostBadge: 'DEFEAT'
        };
    } else if (gameType === 'DRIFT_RACING') {
        return {
            wonTitle: 'FIRST PLACE',
            wonDesc: 'Perfect driving. You dominated the track.',
            wonBadge: 'CHAMPION',
            lostTitle: 'CRASHED',
            lostDesc: 'You hit the wall at high speed.',
            lostBadge: 'WRECKED'
        };
    }
    // Default to Flood / Standard
    return {
        wonTitle: 'MISSION ACCOMPLISHED',
        wonDesc: 'You escaped the flood in time!',
        wonBadge: 'ESCAPED',
        lostTitle: 'MISSION FAILED',
        lostDesc: 'The water overtook you. Speed up to survive next time.',
        lostBadge: 'DROWNED'
    };
  };

  const gameText = getGameText();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-20">
      
      {/* Game Result Banner */}
      {gameStatus && (
        <div className="relative rounded-3xl mb-8">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} variant={gameStatus === 'WON' ? 'default' : 'default'} />
            <div className={`relative z-10 bg-slate-900/50 border backdrop-blur-md rounded-3xl overflow-hidden shadow-xl ${gameStatus === 'WON' ? 'border-green-500/30' : 'border-red-500/30'}`}>
                <div className="flex items-center justify-between p-6 w-full">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${gameStatus === 'WON' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {gameStatus === 'WON' ? (
                                gameType === 'BOMB_DEFUSE' ? <ShieldCheck className="w-8 h-8 text-green-400" /> : 
                                gameType === 'STICKMAN_SHOOTER' ? <Crosshair className="w-8 h-8 text-green-400" /> :
                                gameType === 'DRIFT_RACING' ? <Flag className="w-8 h-8 text-green-400" /> :
                                <Trophy className="w-8 h-8 text-green-400" />
                            ) : (
                                gameType === 'BOMB_DEFUSE' ? <Bomb className="w-8 h-8 text-red-400" /> : 
                                gameType === 'STICKMAN_SHOOTER' ? <Skull className="w-8 h-8 text-red-400" /> :
                                <Skull className="w-8 h-8 text-red-400" />
                            )}
                        </div>
                        <div>
                            <h2 className={`text-3xl font-bold ${gameStatus === 'WON' ? 'text-green-100' : 'text-red-100'}`}>
                                {gameStatus === 'WON' ? gameText.wonTitle : gameText.lostTitle}
                            </h2>
                            <p className="text-slate-400">
                                {gameStatus === 'WON' ? gameText.wonDesc : gameText.lostDesc}
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:block text-5xl font-mono font-bold text-white/10">
                        {gameStatus === 'WON' ? gameText.wonBadge : gameText.lostBadge}
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Primary Metrics Card */}
        <div className="relative rounded-3xl h-full">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl h-full">
                <div className="p-6 w-full h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity size={120} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-primary-400" />
                        Performance Analysis
                    </h2>
                    
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={20} data={chartData}>
                            <RadialBar
                                label={{ position: 'insideStart', fill: '#fff' }}
                                background
                                dataKey="uv"
                            />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                        <div className="p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-3xl font-bold text-primary-400">{result.wpm}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">WPM</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-3xl font-bold text-indigo-400">{result.accuracy}%</div>
                            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Accuracy</div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-xl">
                            <div className="text-3xl font-bold text-pink-400">{result.score}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Score</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* AI Feedback Card */}
        <div className="relative rounded-3xl h-full">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
            <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl h-full">
                <div className="p-6 w-full h-full flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="bg-gradient-to-r from-blue-400 to-primary-400 bg-clip-text text-transparent">Gemini Insights</span>
                    </h2>
                    
                    <div className="mb-6 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <p className="text-slate-300 italic leading-relaxed">"{result.feedback_summary}"</p>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Improvement Areas</h3>
                    <ul className="space-y-3 flex-1">
                        {result.improvement_suggestions.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Detailed Errors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="relative rounded-3xl">
             <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
             <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl h-full">
                 <div className="p-5 w-full">
                    <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                        <XCircle size={16} /> Mistyped
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.mistyped_words.length > 0 ? (
                            result.mistyped_words.map((w, i) => (
                                <span key={i} className="px-2 py-1 bg-red-900/20 text-red-300 text-xs rounded border border-red-900/50">{w}</span>
                            ))
                        ) : <span className="text-slate-500 text-sm italic">None! Perfect!</span>}
                    </div>
                 </div>
             </div>
         </div>
         
         <div className="relative rounded-3xl">
             <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
             <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl h-full">
                 <div className="p-5 w-full">
                    <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                        <Activity size={16} /> Missed
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.missed_words.length > 0 ? (
                            result.missed_words.map((w, i) => (
                                <span key={i} className="px-2 py-1 bg-amber-900/20 text-amber-300 text-xs rounded border border-amber-900/50">{w}</span>
                            ))
                        ) : <span className="text-slate-500 text-sm italic">None</span>}
                    </div>
                 </div>
             </div>
         </div>

         <div className="relative rounded-3xl">
             <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
             <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl h-full">
                 <div className="p-5 w-full">
                    <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                        <Activity size={16} /> Extra
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {result.extra_words.length > 0 ? (
                            result.extra_words.map((w, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-900/20 text-blue-300 text-xs rounded border border-blue-900/50">{w}</span>
                            ))
                        ) : <span className="text-slate-500 text-sm italic">None</span>}
                    </div>
                 </div>
             </div>
         </div>
      </div>

      {/* Feature 2: AI Mistake Analyzer */}
      <div className="mb-10 animate-fade-in-up">
        {!analysis && !isAnalyzing ? (
            <div className="relative rounded-3xl">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <BrainCircuit className="text-indigo-400" />
                                AI Mistake Analyzer
                            </h2>
                            <p className="text-slate-400 max-w-xl">
                                Identify your unique error patterns and generate a personalized micro-drill to correct them instantly.
                            </p>
                        </div>
                        <button 
                            onClick={onAnalyze}
                            className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Practice Plan</span>
                        </button>
                    </div>
                </div>
            </div>
        ) : isAnalyzing ? (
            <div className="relative rounded-3xl">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-12 flex flex-col items-center justify-center space-y-4 w-full animate-pulse">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-indigo-300 font-medium">Analyzing error patterns & generating drills...</p>
                    </div>
                </div>
            </div>
        ) : analysis ? (
            <div className="relative rounded-3xl">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
                <div className="relative z-10 bg-slate-900/50 border border-slate-800 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
                    <div className="w-full">
                        <div className="bg-indigo-950/50 p-6 border-b border-indigo-500/20 flex items-center gap-3">
                            <BrainCircuit className="text-indigo-400 w-6 h-6" />
                            <h2 className="text-xl font-bold text-indigo-100">Personalized Correction Plan</h2>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Pattern Detected
                                    </h3>
                                    <p className="text-slate-200 leading-relaxed">{analysis.pattern_explanation}</p>
                                </div>
                                
                                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Target className="w-3 h-3" /> Next Goal
                                    </h3>
                                    <p className="text-primary-300 font-medium">{analysis.improvement_goal}</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recommended Micro-Drills</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {analysis.micro_drills.map((drill, idx) => (
                                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 font-mono text-slate-300 text-sm">
                                                {drill}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <button 
                                        onClick={() => onStartRemedial(analysis.correction_paragraph)}
                                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 group"
                                    >
                                        <span>Start Correction Exercise</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="text-center text-xs text-slate-500 mt-2">Starts a short session focused on your mistakes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : null}
      </div>

      <div className="flex justify-center border-t border-slate-800/50 pt-10">
        <button 
            onClick={onRestart}
            className="group flex items-center space-x-3 text-slate-400 hover:text-white transition-colors"
        >
            <RefreshCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            <span>Discard & Start New Standard Test</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
