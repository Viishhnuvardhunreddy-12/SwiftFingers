
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flag, Coins, Trophy, Zap, Skull, Activity, Timer } from 'lucide-react';
import * as THREE from 'three';
import { DifficultyMode } from '../types';
import { GlowingEffect } from './ui/glowing-effect';

interface DriftGameProps {
  originalText: string;
  onComplete: (typedText: string, timeTaken: number) => void;
  onRestart: () => void;
  difficulty: DifficultyMode;
}

const DriftGame: React.FC<DriftGameProps> = ({ originalText, onComplete, onRestart, difficulty }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(60);
  const [input, setInput] = useState('');
  const [stats, setStats] = useState({ coins: 0, streak: 0, nitro: false });
  const [activeWords, setActiveWords] = useState<Array<{ id: string; text: string; x: number; y: number; lane: 'LEFT' | 'RIGHT' }>>([]);
  
  // Game Logic Refs (Mutable state that doesn't trigger React renders)
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carRef = useRef<THREE.Group | null>(null);
  const roadRef = useRef<THREE.Mesh | null>(null);
  const wordsDataRef = useRef<Array<{
    id: string;
    text: string;
    lane: -1 | 1; // -1 Left, 1 Right
    z: number;
    mesh?: THREE.Object3D;
  }>>([]);
  const wordPoolRef = useRef<string[]>([]);
  const speedRef = useRef(0);
  const laneRef = useRef(0); // Current car lane (-1 or 1)
  const targetLaneRef = useRef(0); // Where car wants to go
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const frameIdRef = useRef(0);
  const nextSpawnZRef = useRef(-50);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef(0);

  // Initialize Game Logic
  useEffect(() => {
    if (!mountRef.current) return;

    // --- THREE JS SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 200);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, -10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Car Tail Lights (Point Lights)
    const tailLightLeft = new THREE.PointLight(0xff0000, 2, 10);
    tailLightLeft.position.set(-0.6, 1, 2);
    scene.add(tailLightLeft);
    const tailLightRight = new THREE.PointLight(0xff0000, 2, 10);
    tailLightRight.position.set(0.6, 1, 2);
    scene.add(tailLightRight);

    // --- OBJECTS ---
    
    // 1. Road
    const roadGeometry = new THREE.PlaneGeometry(20, 400);
    const roadMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -100;
    road.receiveShadow = true;
    scene.add(road);
    roadRef.current = road;

    // Lane Markings (Simple boxes for now, or texture)
    const stripesGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
        const stripeGeo = new THREE.PlaneGeometry(0.2, 4);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.z = -i * 10;
        stripe.position.y = 0.01; // Slightly above road
        stripesGroup.add(stripe);
    }
    scene.add(stripesGroup);

    // 2. The Car (Procedural Group)
    const carGroup = new THREE.Group();
    
    // Chassis
    const chassisGeo = new THREE.BoxGeometry(1.8, 0.5, 4);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.2, metalness: 0.6 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.5;
    chassis.castShadow = true;
    carGroup.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.4, 0.6, 2);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.0, metalness: 0.9 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.y = 1.0;
    cabin.position.z = -0.2;
    carGroup.add(cabin);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const wheelPositions = [
        { x: -1, z: 1.2 }, { x: 1, z: 1.2 },
        { x: -1, z: -1.2 }, { x: 1, z: -1.2 }
    ];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, 0.4, pos.z);
        carGroup.add(wheel);
    });

    // Spoiler
    const spoilerGeo = new THREE.BoxGeometry(1.8, 0.1, 0.4);
    const spoiler = new THREE.Mesh(spoilerGeo, chassisMat);
    spoiler.position.set(0, 1.0, 1.8);
    carGroup.add(spoiler);

    scene.add(carGroup);
    carRef.current = carGroup;

    // 3. Environment (Trees)
    const treeGeo = new THREE.ConeGeometry(1, 3, 8);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x0f5522, flatShading: true });
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3c31 });
    
    const treesGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
        // Left Side
        const treeL = new THREE.Group();
        const crownL = new THREE.Mesh(treeGeo, treeMat);
        crownL.position.y = 1.5;
        const trunkL = new THREE.Mesh(trunkGeo, trunkMat);
        trunkL.position.y = 0.5;
        treeL.add(crownL, trunkL);
        treeL.position.set(-6 - Math.random() * 10, 0, -i * 10 - Math.random() * 5);
        treesGroup.add(treeL);

        // Right Side
        const treeR = treeL.clone();
        treeR.position.set(6 + Math.random() * 10, 0, -i * 10 - Math.random() * 5);
        treesGroup.add(treeR);
    }
    scene.add(treesGroup);


    // --- ANIMATION LOOP ---
    const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);

        const delta = 0.016; // Approx 60fps
        const currentSpeed = speedRef.current; // units per second

        if (speedRef.current > 0) {
            // Move Road Texture / Stripes
            stripesGroup.position.z += currentSpeed * delta;
            if (stripesGroup.position.z > 10) stripesGroup.position.z = 0;

            // Move Trees
            treesGroup.position.z += currentSpeed * delta;
            if (treesGroup.position.z > 10) treesGroup.position.z = 0;

            // Move Words
            updateWords(delta, currentSpeed);

            // Car Physics (Lerp to lane)
            if (carRef.current) {
                // Target X: Lane -1 = -3, Lane 1 = 3
                const targetX = targetLaneRef.current * 3;
                carRef.current.position.x += (targetX - carRef.current.position.x) * 5 * delta;
                
                // Tilt (Roll) based on movement
                const tilt = (targetX - carRef.current.position.x) * -0.1;
                carRef.current.rotation.z = tilt;
                
                // Yaw (Steering)
                carRef.current.rotation.y = (targetX - carRef.current.position.x) * -0.1;

                // Nitro Shake
                if (stats.nitro) {
                     carRef.current.position.y = 0.5 + (Math.random() * 0.05);
                } else {
                     carRef.current.position.y = 0.5;
                }

                // Update Tail Lights to follow car
                tailLightLeft.position.x = carRef.current.position.x - 0.6;
                tailLightRight.position.x = carRef.current.position.x + 0.6;
            }
        }

        renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
        cancelAnimationFrame(frameIdRef.current);
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, []); // Run once on mount

  // Initialize Game Data
  useEffect(() => {
    wordPoolRef.current = originalText.split(/\s+/).filter(w => w.length > 0).sort(() => Math.random() - 0.5);
    speedRef.current = 0; // Stopped initially
  }, [originalText]);

  // Game Logic Helper functions (Outside React render cycle)
  const spawnWord = () => {
     if (wordPoolRef.current.length < 2) {
         // Refill
         wordPoolRef.current = originalText.split(/\s+/).sort(() => Math.random() - 0.5);
     }

     const text = wordPoolRef.current.pop() || "DRIFT";
     // Random lane
     const lane = Math.random() > 0.5 ? 1 : -1;
     
     wordsDataRef.current.push({
         id: `w-${Date.now()}`,
         text,
         lane,
         z: -100 // Spawn far away
     });
  };

  const updateWords = (delta: number, speed: number) => {
     // Spawn logic
     if (wordsDataRef.current.length === 0 || wordsDataRef.current[wordsDataRef.current.length - 1].z > -70) {
         spawnWord();
     }

     // Move words
     wordsDataRef.current.forEach(w => {
         w.z += speed * delta;
     });

     // Check Collision (Missed)
     // Car is at Z=0. If word > 2, it's missed.
     const missed = wordsDataRef.current.filter(w => w.z > 2);
     if (missed.length > 0) {
         handleCrash();
         // Remove missed words
         wordsDataRef.current = wordsDataRef.current.filter(w => w.z <= 2);
     }

     // Project to 2D for React UI
     const projected = wordsDataRef.current.map(w => {
         if (!cameraRef.current) return null;
         
         const vec = new THREE.Vector3(w.lane * 3, 1.5, w.z);
         vec.project(cameraRef.current);

         const x = (vec.x * .5 + .5) * mountRef.current!.clientWidth;
         const y = (-(vec.y * .5) + .5) * mountRef.current!.clientHeight;
         
         // Basic culling
         if (w.z > 5) return null;

         return {
             id: w.id,
             text: w.text,
             lane: w.lane === -1 ? 'LEFT' : 'RIGHT',
             x,
             y
         };
     }).filter(Boolean) as any;

     setActiveWords(projected);
  };

  const handleStart = () => {
    setGameState('PLAYING');
    speedRef.current = difficulty === 'BEGINNER' ? 20 : difficulty === 'HARD' ? 40 : 30;
    startTimeRef.current = Date.now();
    inputRef.current?.focus();
  };

  const handleCrash = () => {
      // Camera Shake Effect
      if (cameraRef.current) {
          cameraRef.current.position.y += 0.5;
          setTimeout(() => cameraRef.current!.position.y = 3, 100);
      }
      
      streakRef.current = 0;
      setStats(prev => ({ ...prev, streak: 0, nitro: false }));
      
      // Flash red
      if (mountRef.current) {
          mountRef.current.style.backgroundColor = '#500000';
          setTimeout(() => mountRef.current!.style.backgroundColor = 'transparent', 100);
      }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (!val) {
        setInput(e.target.value); 
        return;
    }

    // Check closest words
    // We only care about words closer than Z = -50 (visible)
    const candidates = wordsDataRef.current.filter(w => w.z > -60);
    
    // Exact match?
    const match = candidates.find(w => w.text.toLowerCase() === val.toLowerCase());
    
    if (match) {
        // Success!
        targetLaneRef.current = match.lane; // Steer car
        laneRef.current = match.lane;
        
        // Remove word
        wordsDataRef.current = wordsDataRef.current.filter(w => w.id !== match.id);
        
        // Update Stats
        scoreRef.current += stats.nitro ? 20 : 10;
        streakRef.current += 1;
        
        const isNitro = streakRef.current >= 5;
        if (isNitro) speedRef.current = difficulty === 'HARD' ? 50 : 40; // Boost speed
        
        setStats({
            coins: scoreRef.current,
            streak: streakRef.current,
            nitro: isNitro
        });

        setInput('');
    } else {
        // Partial typing... update UI
        setInput(e.target.value);
    }
  };

  // Timer
  useEffect(() => {
    let interval: any;
    if (gameState === 'PLAYING') {
        interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleGameOver = () => {
      setGameState('WON');
      speedRef.current = 0;
      onComplete(originalText, 60);
  };

  return (
    <div className="w-full h-screen max-h-[700px] relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-black">
      
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start">
               <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
               <div className="relative bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 flex gap-6 shadow-xl">
                   <div className="flex items-center gap-2">
                       <Coins className="text-yellow-400" />
                       <span className="text-2xl font-mono font-bold text-white">{stats.coins}</span>
                   </div>
                   <div className="w-px h-8 bg-slate-600"></div>
                   <div className="flex items-center gap-2">
                       <Zap className={`w-5 h-5 ${stats.nitro ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                       <span className={`font-bold ${stats.nitro ? 'text-blue-400' : 'text-slate-500'}`}>
                           {stats.nitro ? 'NITRO ACTIVE' : 'NITRO READY'}
                       </span>
                   </div>
               </div>

               <div className="relative bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 flex gap-2 shadow-xl">
                    <Timer className={`w-6 h-6 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`} />
                    <span className="text-2xl font-mono font-bold text-white">{timeLeft}</span>
               </div>
          </div>

          {/* Word Overlays */}
          {activeWords.map(word => (
              <div 
                key={word.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: word.x, top: word.y }}
              >
                 <div className={`
                    px-4 py-2 rounded-lg font-mono font-bold text-lg shadow-lg
                    ${input && word.text.toLowerCase().startsWith(input.trim().toLowerCase()) 
                        ? 'bg-yellow-400 text-black scale-110' 
                        : 'bg-slate-900/90 text-white border border-slate-600'}
                 `}>
                    {word.text}
                 </div>
                 {/* Lane Indicator */}
                 <div className={`text-[10px] text-center mt-1 font-bold ${word.lane === 'LEFT' ? 'text-blue-400' : 'text-green-400'}`}>
                     {word.lane}
                 </div>
              </div>
          ))}
      </div>

      {/* Start Screen - Moved to Top Level Z-50 */}
      {gameState === 'IDLE' && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
             <button 
                onClick={handleStart}
                className="group bg-white text-black px-8 py-4 rounded-xl font-bold text-2xl hover:scale-105 transition-all flex items-center gap-3 shadow-2xl shadow-white/10"
             >
                 <Flag className="w-8 h-8 text-black group-hover:text-red-600 transition-colors" />
                 START RACE
             </button>
         </div>
      )}

      {/* Input Handling - Disabled when Idle to let clicks pass */}
      <input 
        ref={inputRef}
        type="text" 
        className={`absolute inset-0 opacity-0 z-20 cursor-default ${gameState === 'IDLE' ? 'pointer-events-none' : 'pointer-events-auto'}`}
        value={input}
        onChange={handleInput}
        autoFocus
      />
      
    </div>
  );
};

export default DriftGame;
