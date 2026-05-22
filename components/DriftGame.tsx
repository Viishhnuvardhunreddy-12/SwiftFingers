import React, { useState, useEffect, useRef } from 'react';
import { Flag, Coins, Zap, Timer, RotateCcw, Trophy, Skull } from 'lucide-react';
import { DifficultyMode } from '../types';

interface DriftGameProps {
  originalText: string;
  onComplete: (typedText: string, timeTaken: number) => void;
  onRestart: () => void;
  difficulty: DifficultyMode;
}

interface WordObj {
  id: number;
  text: string;
  lane: 0 | 1; // 0=LEFT, 1=RIGHT
  y: number;   // 0 (top) → 1 (bottom/car)
  typed: boolean;
  missed: boolean;
}

// All game state lives here — never in React state (avoids stale closures)
interface GameState {
  words: WordObj[];
  wordPool: string[];
  speed: number;
  lives: number;
  coins: number;
  streak: number;
  nitro: boolean;
  carLane: number; // 0=left, 0.5=center, 1=right
  carTargetLane: number;
  timeLeft: number;
  typedWords: string[];
  idCounter: number;
  lastSpawnY: number; // y of last spawned word (to space them out)
  running: boolean;
  startTime: number;
}

const BASE_SPEED: Record<DifficultyMode, number> = {
  BEGINNER: 0.0018,
  INTERMEDIATE: 0.0028,
  HARD: 0.004,
};

const SPAWN_GAP = 0.35; // minimum y gap between spawned words

const DriftGame: React.FC<DriftGameProps> = ({ originalText, onComplete, onRestart, difficulty }) => {
  // UI state (only what needs to re-render)
  const [uiWords, setUiWords] = useState<WordObj[]>([]);
  const [uiHud, setUiHud] = useState({ coins: 0, streak: 0, nitro: false, lives: 3, timeLeft: 60, carLane: 0.5 });
  const [phase, setPhase] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [input, setInput] = useState('');
  const [flashRed, setFlashRed] = useState(false);

  // Mutable game state ref — the single source of truth for the loop
  const gs = useRef<GameState>({
    words: [], wordPool: [], speed: BASE_SPEED[difficulty],
    lives: 3, coins: 0, streak: 0, nitro: false,
    carLane: 0.5, carTargetLane: 0.5,
    timeLeft: 60, typedWords: [], idCounter: 0,
    lastSpawnY: -SPAWN_GAP, running: false, startTime: 0,
  });

  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const phaseRef = useRef<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');

  // Animated background refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgOffsetRef = useRef(0); // scrolling offset for trees/mountains

  const setPhaseSync = (p: 'IDLE' | 'PLAYING' | 'WON' | 'LOST') => {
    phaseRef.current = p;
    setPhase(p);
  };

  const buildPool = () => {
    const words = originalText.split(/\s+/).filter(w => w.length > 0);
    // shuffle
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  };

  const spawnWord = () => {
    const g = gs.current;
    if (g.wordPool.length === 0) g.wordPool = buildPool();
    const text = g.wordPool.pop()!;
    const lane = (Math.random() > 0.5 ? 1 : 0) as 0 | 1;
    g.words.push({ id: g.idCounter++, text, lane, y: 0, typed: false, missed: false });
    g.lastSpawnY = 0;
  };

  // ── Background canvas draw ──────────────────────────────────────────────
  const drawBackground = (offset: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#050510');
    sky.addColorStop(0.5, '#0d0d2b');
    sky.addColorStop(1, '#1a1040');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars (static, small dots)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const starSeeds = [17,31,53,79,97,113,137,151,173,191,211,233,251,271,293,311,331,353,373,397];
    starSeeds.forEach((s, i) => {
      const sx = (s * 37 + i * 113) % W;
      const sy = (s * 19 + i * 71) % (H * 0.45);
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mountains (parallax layer 1 — slow)
    const mOff = (offset * 0.15) % W;
    ctx.fillStyle = '#1e1b4b';
    for (let m = -1; m <= 2; m++) {
      const mx = m * W - mOff;
      ctx.beginPath();
      ctx.moveTo(mx, H * 0.55);
      ctx.lineTo(mx + W * 0.15, H * 0.22);
      ctx.lineTo(mx + W * 0.3, H * 0.55);
      ctx.lineTo(mx + W * 0.45, H * 0.18);
      ctx.lineTo(mx + W * 0.6, H * 0.55);
      ctx.lineTo(mx + W * 0.75, H * 0.28);
      ctx.lineTo(mx + W, H * 0.55);
      ctx.closePath();
      ctx.fill();
    }

    // Mountain snow caps
    ctx.fillStyle = 'rgba(200,210,255,0.15)';
    for (let m = -1; m <= 2; m++) {
      const mx = m * W - mOff;
      [[mx + W*0.15, H*0.22, 18], [mx + W*0.45, H*0.18, 22], [mx + W*0.75, H*0.28, 15]].forEach(([px, py, r]) => {
        ctx.beginPath();
        ctx.arc(px as number, py as number, r as number, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Road surface
    const roadL = W * 0.15, roadR = W * 0.85;
    const road = ctx.createLinearGradient(0, H * 0.5, 0, H);
    road.addColorStop(0, '#111827');
    road.addColorStop(1, '#1f2937');
    ctx.fillStyle = road;
    ctx.fillRect(roadL, H * 0.5, roadR - roadL, H * 0.5);

    // Road edges
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(roadL, H * 0.5); ctx.lineTo(roadL, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(roadR, H * 0.5); ctx.lineTo(roadR, H); ctx.stroke();

    // Center dashes (animated)
    const dashH = 40, dashGap = 30, totalCycle = dashH + dashGap;
    const dashOff = offset % totalCycle;
    ctx.strokeStyle = 'rgba(250,204,21,0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([dashH, dashGap]);
    ctx.lineDashOffset = -dashOff;
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H * 0.5);
    ctx.lineTo(W * 0.5, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lane dividers (faint)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    [0.35, 0.65].forEach(lx => {
      ctx.beginPath(); ctx.moveTo(W * lx, H * 0.5); ctx.lineTo(W * lx, H); ctx.stroke();
    });

    // Trees (parallax layer 2 — faster)
    const treeOff = offset % 120;
    const drawTree = (tx: number, ty: number, scale: number) => {
      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 4 * scale, ty, 8 * scale, 20 * scale);
      // Canopy layers
      [[0, 0, 22], [0, -14, 18], [0, -26, 13]].forEach(([dx, dy, r]) => {
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.arc(tx + dx * scale, ty + dy * scale, r * scale, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(34,197,94,0.3)';
        ctx.beginPath();
        ctx.arc(tx + dx * scale - 4 * scale, ty + dy * scale - 4 * scale, r * 0.4 * scale, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Left side trees
    for (let i = 0; i < 5; i++) {
      const ty = H * 0.52 + i * 120 - treeOff;
      if (ty > H * 0.45 && ty < H + 60) {
        const scale = 0.5 + (ty / H) * 0.7;
        drawTree(W * 0.08 + (i % 2) * 20, ty, scale);
        drawTree(W * 0.12 - (i % 3) * 10, ty + 30, scale * 0.8);
      }
    }
    // Right side trees
    for (let i = 0; i < 5; i++) {
      const ty = H * 0.52 + i * 120 - treeOff + 60;
      if (ty > H * 0.45 && ty < H + 60) {
        const scale = 0.5 + (ty / H) * 0.7;
        drawTree(W * 0.92 - (i % 2) * 20, ty, scale);
        drawTree(W * 0.88 + (i % 3) * 10, ty + 30, scale * 0.8);
      }
    }

    // Horizon glow
    const hGlow = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.5);
    hGlow.addColorStop(0, 'rgba(99,102,241,0.12)');
    hGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = hGlow;
    ctx.fillRect(0, H * 0.3, W, H * 0.3);
  };

  // ── Main game loop ──────────────────────────────────────────────────────
  const loop = (ts: number) => {
    if (phaseRef.current !== 'PLAYING') return;
    const dt = lastTsRef.current ? Math.min((ts - lastTsRef.current) / 1000, 0.05) : 0.016;
    lastTsRef.current = ts;

    const g = gs.current;
    const speed = g.speed * (g.nitro ? 1.7 : 1);

    // Advance background scroll
    bgOffsetRef.current += speed * 600;
    drawBackground(bgOffsetRef.current);

    // Smooth car lane
    g.carLane += (g.carTargetLane - g.carLane) * Math.min(dt * 8, 1);

    // Move words down
    let missedAny = false;
    g.words = g.words.map(w => {
      if (w.typed || w.missed) return w;
      const ny = w.y + speed;
      if (ny >= 1.0) { missedAny = true; return { ...w, y: ny, missed: true }; }
      return { ...w, y: ny };
    });

    // Update lastSpawnY to track the most-recently-spawned word's current position
    // (we track it as the minimum y among active words)
    const activeWords = g.words.filter(w => !w.typed && !w.missed);
    const minY = activeWords.length > 0 ? Math.min(...activeWords.map(w => w.y)) : 1;

    // Spawn: keep 2-3 words on screen, spaced out
    const totalActive = activeWords.length;
    if (totalActive < 3 && minY > SPAWN_GAP) {
      spawnWord();
    }

    // Remove words that are fully off screen
    g.words = g.words.filter(w => w.y < 1.2);

    // Push UI update (throttled — every frame is fine since canvas handles bg)
    setUiWords([...g.words]);
    setUiHud({ coins: g.coins, streak: g.streak, nitro: g.nitro, lives: g.lives, timeLeft: g.timeLeft, carLane: g.carLane });

    if (missedAny) handleMiss();

    rafRef.current = requestAnimationFrame(loop);
  };

  const handleMiss = () => {
    const g = gs.current;
    g.lives -= 1;
    g.streak = 0;
    g.nitro = false;
    g.speed = BASE_SPEED[difficulty];
    setFlashRed(true);
    setTimeout(() => setFlashRed(false), 350);
    if (g.lives <= 0) endGame('LOST');
  };

  const endGame = (result: 'WON' | 'LOST') => {
    gs.current.running = false;
    cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhaseSync(result);
    const elapsed = (Date.now() - gs.current.startTime) / 1000;
    onComplete(gs.current.typedWords.join(' ') || originalText, elapsed);
  };

  const handleStart = () => {
    const g = gs.current;
    g.words = [];
    g.wordPool = buildPool();
    g.speed = BASE_SPEED[difficulty];
    g.lives = 3;
    g.coins = 0;
    g.streak = 0;
    g.nitro = false;
    g.carLane = 0.5;
    g.carTargetLane = 0.5;
    g.timeLeft = 60;
    g.typedWords = [];
    g.idCounter = 0;
    g.lastSpawnY = -SPAWN_GAP;
    g.running = true;
    g.startTime = Date.now();
    bgOffsetRef.current = 0;

    // Spawn first 2 words staggered
    spawnWord();
    g.words[0].y = 0;
    spawnWord();
    if (g.words[1]) g.words[1].y = 0.05;

    setPhaseSync('PLAYING');
    setInput('');
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);

    // Timer
    timerRef.current = setInterval(() => {
      gs.current.timeLeft -= 1;
      if (gs.current.timeLeft <= 0) endGame('WON');
    }, 1000);

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Cleanup
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawBackground(bgOffsetRef.current);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Draw idle background
  useEffect(() => {
    drawBackground(0);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return;

    const g = gs.current;
    const match = g.words.find(w => !w.typed && !w.missed && w.text.toLowerCase() === trimmed);
    if (match) {
      // Steer car
      g.carTargetLane = match.lane === 0 ? 0.25 : 0.75;
      // Mark typed
      match.typed = true;
      g.typedWords.push(match.text);
      g.streak += 1;
      g.coins += g.nitro ? 20 : 10;
      if (g.streak >= 5) { g.nitro = true; g.speed = BASE_SPEED[difficulty] * 1.5; }
      setInput('');
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────
  // Convert word y (0→1) to CSS top% — words travel from 5% to 82%
  const wordTop = (y: number) => `${5 + y * 77}%`;
  // Convert carLane (0→1) to CSS left%
  const carLeft = `${uiHud.carLane * 70 + 15}%`;

  const wordClass = (w: WordObj) => {
    const trimmed = input.trim().toLowerCase();
    const isHint = trimmed && w.text.toLowerCase().startsWith(trimmed) && !w.typed && !w.missed;
    if (w.typed)   return 'bg-green-500/70 text-white border-green-400 opacity-40 scale-90';
    if (w.missed)  return 'bg-red-600/70 text-white border-red-400 opacity-40';
    if (isHint)    return 'bg-yellow-400 text-black border-yellow-300 scale-110 shadow-lg shadow-yellow-400/40';
    return 'bg-slate-900/90 text-white border-slate-500';
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl border border-slate-800 select-none"
      style={{ height: '620px' }}>

      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Flash red on miss */}
      {flashRed && <div className="absolute inset-0 z-10 bg-red-600/25 pointer-events-none" />}

      {/* Nitro speed lines */}
      {uiHud.nitro && phase === 'PLAYING' && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {[10,25,40,55,70,85].map(lp => (
            <div key={lp} className="absolute top-0 bottom-0 w-px bg-blue-400/20 animate-pulse"
              style={{ left: `${lp}%` }} />
          ))}
        </div>
      )}

      {/* Words overlay */}
      {phase === 'PLAYING' && uiWords.map(word => (
        <div key={word.id}
          className="absolute z-20 pointer-events-none"
          style={{
            left: word.lane === 0 ? '25%' : '75%',
            top: wordTop(word.y),
            transform: 'translate(-50%, -50%)',
          }}>
          <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm border transition-colors ${wordClass(word)}`}>
            {input.trim() && word.text.toLowerCase().startsWith(input.trim().toLowerCase()) && !word.typed && !word.missed ? (
              <>
                <span className="text-orange-800 font-black">{word.text.slice(0, input.trim().length)}</span>
                <span>{word.text.slice(input.trim().length)}</span>
              </>
            ) : word.text}
          </div>
          <div className={`text-[9px] text-center font-bold mt-0.5 ${word.lane === 0 ? 'text-blue-400' : 'text-green-400'}`}>
            {word.lane === 0 ? 'LEFT' : 'RIGHT'}
          </div>
        </div>
      ))}

      {/* Car */}
      {phase === 'PLAYING' && (
        <div className="absolute z-20 pointer-events-none"
          style={{ left: carLeft, bottom: '10%', transform: 'translateX(-50%)', transition: 'left 0.25s ease-out' }}>
          {uiHud.nitro && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
              <svg viewBox="0 0 20 28" className="w-5 h-7 animate-pulse">
                <path d="M10 28 Q6 20 8 14 Q10 8 10 2 Q10 8 12 14 Q14 20 10 28Z" fill="#f97316" opacity="0.9"/>
                <path d="M10 24 Q8 18 9 14 Q10 10 10 6 Q10 10 11 14 Q12 18 10 24Z" fill="#fef08a" opacity="0.8"/>
              </svg>
            </div>
          )}
          <svg width="44" height="72" viewBox="0 0 44 72" fill="none">
            <rect x="7" y="18" width="30" height="40" rx="6" fill="#dc2626"/>
            <rect x="11" y="8"  width="22" height="22" rx="4" fill="#1e293b"/>
            <rect x="13" y="10" width="18" height="16" rx="3" fill="#334155" opacity="0.9"/>
            <rect x="3"  y="46" width="7"  height="11" rx="3" fill="#111"/>
            <rect x="34" y="46" width="7"  height="11" rx="3" fill="#111"/>
            <rect x="3"  y="24" width="7"  height="11" rx="3" fill="#111"/>
            <rect x="34" y="24" width="7"  height="11" rx="3" fill="#111"/>
            <rect x="9"  y="54" width="26" height="5"  rx="2" fill="#991b1b"/>
            <circle cx="15" cy="15" r="3" fill="#fef08a" opacity="0.95"/>
            <circle cx="29" cy="15" r="3" fill="#fef08a" opacity="0.95"/>
            <circle cx="13" cy="57" r="2.5" fill="#ef4444" opacity="0.9"/>
            <circle cx="31" cy="57" r="2.5" fill="#ef4444" opacity="0.9"/>
            <rect x="10" y="30" width="24" height="8" rx="2" fill="#b91c1c" opacity="0.5"/>
          </svg>
        </div>
      )}

      {/* HUD */}
      {phase === 'PLAYING' && (
        <div className="absolute inset-x-0 top-0 z-30 p-3 flex justify-between items-start pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 border border-slate-700/50 flex gap-3 items-center">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-base font-mono font-bold text-white">{uiHud.coins}</span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-1">
              <Zap className={`w-4 h-4 ${uiHud.nitro ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
              <span className={`text-xs font-bold ${uiHud.nitro ? 'text-blue-400' : 'text-slate-400'}`}>
                {uiHud.nitro ? 'NITRO!' : `x${uiHud.streak}`}
              </span>
            </div>
          </div>

          <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 border border-slate-700/50 flex gap-1.5 items-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" className={`w-5 h-5 transition-all ${i < uiHud.lives ? 'fill-red-500' : 'fill-slate-700'}`}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ))}
          </div>

          <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 border border-slate-700/50 flex gap-1.5 items-center">
            <Timer className={`w-4 h-4 ${uiHud.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`} />
            <span className={`text-base font-mono font-bold ${uiHud.timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
              {uiHud.timeLeft}s
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      {phase === 'PLAYING' && (
        <div className="absolute inset-x-0 bottom-0 z-30 p-3 flex flex-col items-center gap-1.5">
          <p className="text-[10px] text-slate-500 font-mono">Type the word — car steers to its lane</p>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            placeholder="type here..."
            className="w-56 px-4 py-2 bg-black/80 border-2 border-slate-600 focus:border-yellow-400 rounded-xl text-white font-mono text-center text-base outline-none transition-colors placeholder:text-slate-700"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      )}

      {/* IDLE screen */}
      {phase === 'IDLE' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-5">
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Drift Racing</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              Words fall down two lanes. Type them to steer your car into that lane.
              Miss 3 words and you crash!
            </p>
          </div>
          <div className="flex gap-8 text-center text-sm">
            <div className="bg-blue-950/60 border border-blue-800/50 rounded-xl px-4 py-2">
              <div className="text-blue-400 font-bold text-base">LEFT lane</div>
              <div className="text-slate-400 text-xs">steer left</div>
            </div>
            <div className="bg-green-950/60 border border-green-800/50 rounded-xl px-4 py-2">
              <div className="text-green-400 font-bold text-base">RIGHT lane</div>
              <div className="text-slate-400 text-xs">steer right</div>
            </div>
          </div>
          <div className="text-slate-500 text-xs">Difficulty: <span className="text-white font-bold">{difficulty}</span></div>
          <button onClick={handleStart}
            className="group bg-white text-black px-8 py-3.5 rounded-xl font-bold text-xl hover:scale-105 transition-all flex items-center gap-3 shadow-2xl">
            <Flag className="w-6 h-6 group-hover:text-red-600 transition-colors" />
            START RACE
          </button>
        </div>
      )}

      {/* WON screen */}
      {phase === 'WON' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-5">
          <Trophy className="w-14 h-14 text-yellow-400 animate-bounce" />
          <div className="text-center">
            <h2 className="text-4xl font-black text-yellow-400 mb-1">Race Complete!</h2>
            <p className="text-slate-300 text-sm">You survived the full race!</p>
          </div>
          <div className="flex gap-8 text-center">
            <div><div className="text-3xl font-black text-white">{uiHud.coins}</div><div className="text-slate-400 text-xs">Coins</div></div>
            <div><div className="text-3xl font-black text-white">{gs.current.typedWords.length}</div><div className="text-slate-400 text-xs">Words</div></div>
          </div>
          <button onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:bg-yellow-300 transition-colors">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}

      {/* LOST screen */}
      {phase === 'LOST' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-5">
          <Skull className="w-14 h-14 text-red-500 animate-pulse" />
          <div className="text-center">
            <h2 className="text-4xl font-black text-red-500 mb-1">Crashed!</h2>
            <p className="text-slate-300 text-sm">You missed too many words.</p>
          </div>
          <div className="flex gap-8 text-center">
            <div><div className="text-3xl font-black text-white">{uiHud.coins}</div><div className="text-slate-400 text-xs">Coins</div></div>
            <div><div className="text-3xl font-black text-white">{gs.current.typedWords.length}</div><div className="text-slate-400 text-xs">Words</div></div>
          </div>
          <button onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default DriftGame;
