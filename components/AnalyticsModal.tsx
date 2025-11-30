
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis } from 'recharts';
import { GlowingEffect } from './ui/glowing-effect';
import { getDailyActivity, getWeakestKeys } from '../services/historyService';
import { DailyStats, WeakKeyStats } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumStatsIcon = ({ name, className = "w-8 h-8" }: { name: string, className?: string }) => {
  const commonClasses = `drop-shadow-lg ${className}`;
  
  switch(name) {
    case 'analytics': // 3D Isometric Chart
      return (
        <svg viewBox="0 0 24 24" fill="none" className={commonClasses}>
           <defs>
             <linearGradient id="grad-ana-1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#818cf8"/><stop offset="1" stopColor="#4f46e5"/></linearGradient>
             <linearGradient id="grad-ana-2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a5b4fc"/><stop offset="1" stopColor="#6366f1"/></linearGradient>
             <linearGradient id="grad-ana-3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4338ca"/><stop offset="1" stopColor="#312e81"/></linearGradient>
           </defs>
           {/* Bar 1 */}
           <path d="M4 12 L8 10 V18 L4 20 Z" fill="url(#grad-ana-3)" />
           <path d="M8 10 L12 12 V20 L8 18 Z" fill="url(#grad-ana-1)" />
           <path d="M4 12 L8 10 L12 12 L8 14 Z" fill="url(#grad-ana-2)" />
           
           {/* Bar 2 (Taller) */}
           <path d="M10 7 L14 5 V16 L10 18 Z" fill="url(#grad-ana-3)" />
           <path d="M14 5 L18 7 V18 L14 16 Z" fill="url(#grad-ana-1)" />
           <path d="M10 7 L14 5 L18 7 L14 9 Z" fill="url(#grad-ana-2)" />
        </svg>
      );
    case 'time': // 3D Clock
      return (
         <svg viewBox="0 0 24 24" fill="none" className={commonClasses}>
            <defs>
              <linearGradient id="grad-clock-face" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#2dd4bf" />
                 <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <linearGradient id="grad-clock-rim" x1="0" y1="0" x2="1" y2="1">
                 <stop offset="0%" stopColor="#ccfbf1" />
                 <stop offset="100%" stopColor="#115e59" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" fill="#134e4a" stroke="url(#grad-clock-rim)" strokeWidth="2" />
            <circle cx="12" cy="12" r="8" fill="url(#grad-clock-face)" opacity="0.8" />
            <path d="M12 7V12L15 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="1.5" fill="white" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="#115e59" strokeWidth="2" strokeLinecap="round" />
         </svg>
      );
    case 'keyboard': // 3D Keycap
       return (
         <svg viewBox="0 0 24 24" fill="none" className={commonClasses}>
            <defs>
               <linearGradient id="grad-key-top" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#e11d48" />
               </linearGradient>
               <linearGradient id="grad-key-side" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#881337" />
               </linearGradient>
            </defs>
            <path d="M5 6 H19 L17 14 H7 L5 6 Z" fill="url(#grad-key-top)" stroke="#fda4af" strokeWidth="0.5" />
            <path d="M5 6 L3 18 H21 L19 6" fill="none" />
            <path d="M3 18 H21 L17 14 H7 L3 18 Z" fill="url(#grad-key-side)" />
            <path d="M3 18 v2 c0 1 1 2 2 2 h14 c1 0 2-1 2-2 v-2" fill="url(#grad-key-side)" opacity="0.8" />
            <text x="12" y="11.5" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="monospace">!</text>
         </svg>
       )
    default:
        return null;
  }
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weakKeys, setWeakKeys] = useState<WeakKeyStats[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDailyStats(getDailyActivity());
      setWeakKeys(getWeakestKeys());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl animate-fade-in-up">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
        <div className="relative z-10 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-950/30 rounded-2xl flex items-center justify-center border border-indigo-900/50 shadow-inner">
                        <PremiumStatsIcon name="analytics" className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
                        <p className="text-xs text-zinc-400">Your training history and error patterns</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Daily Activity Graph */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/10 transition-colors"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <PremiumStatsIcon name="time" className="w-6 h-6" />
                            <h3 className="text-lg font-bold text-white">Daily Activity (Minutes)</h3>
                        </div>
                        <div className="h-64 w-full relative z-10">
                            {dailyStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyStats}>
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#52525b" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false}
                                        />
                                        <YAxis hide />
                                        <Tooltip 
                                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                        />
                                        <Bar 
                                            dataKey="minutes" 
                                            fill="url(#grad-bar)" 
                                            radius={[4, 4, 0, 0]} 
                                            barSize={40} 
                                            className="hover:opacity-80 transition-opacity"
                                        >
                                            <defs>
                                                <linearGradient id="grad-bar" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#2dd4bf" />
                                                    <stop offset="100%" stopColor="#0f766e" />
                                                </linearGradient>
                                            </defs>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                                    No activity recorded yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weak Keys Heatmap */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors"></div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <PremiumStatsIcon name="keyboard" className="w-6 h-6" />
                            <h3 className="text-lg font-bold text-white">Weak Keys</h3>
                        </div>
                        {weakKeys.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 relative z-10">
                                {weakKeys.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center group/key">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-2xl font-mono font-bold text-white mb-2 shadow-lg relative overflow-hidden group-hover/key:border-rose-500/50 transition-colors transform group-hover/key:translate-y-1 duration-200">
                                            {/* Keycap top gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                                            <span className="relative z-10 drop-shadow-md">{item.char.toUpperCase()}</span>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
                                        </div>
                                        <span className="text-[10px] text-rose-400 font-medium bg-rose-950/30 px-2 py-0.5 rounded-full">
                                            {item.count} misses
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-center p-4">
                                <PremiumStatsIcon name="keyboard" className="w-16 h-16 mb-4 opacity-20 grayscale" />
                                <p>Perfect typing! No consistent weak keys found yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Info / Footer inside modal */}
                <div className="text-center text-zinc-500 text-xs border-t border-zinc-800 pt-6">
                    Statistics are stored locally on your device. Clearing browser cache will reset this data.
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
