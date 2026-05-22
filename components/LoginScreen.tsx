import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Keyboard, Zap, Trophy, Target } from 'lucide-react';
import { clerkAppearance } from '../lib/clerkConfig';

const LoginScreen: React.FC = () => {
  return (
    <div 
      className="min-h-screen font-sans flex items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, #18181b 0%, #000000 100%)',
        backgroundSize: '100% 100%',
        backgroundColor: '#000000'
      }}
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="p-3 bg-primary-500/20 rounded-2xl border border-primary-500/30">
              <Keyboard className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              Swift<span className="text-primary-400">Fingers</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl text-zinc-300 font-medium">
            Master typing through <span className="text-primary-400">AI-powered</span> games
          </p>

          {/* Features */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 shrink-0">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">5 Game Modes</h3>
                <p className="text-zinc-400 text-sm">From classic typing to bomb defusal and racing</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-violet-500/20 rounded-lg border border-violet-500/30 shrink-0">
                <Target className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">AI-Powered Analysis</h3>
                <p className="text-zinc-400 text-sm">Gemini AI identifies your weak keys and creates custom drills</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30 shrink-0">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Track Progress</h3>
                <p className="text-zinc-400 text-sm">Detailed analytics, WPM tracking, and improvement insights</p>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary-400">5</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Game Modes</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">3</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Difficulties</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-violet-400">∞</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">AI Content</div>
            </div>
          </div>
        </div>

        {/* Right Side - Clerk Sign In */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <SignIn 
              appearance={clerkAppearance}
              routing="virtual"
              signUpForceRedirectUrl="/"
              forceRedirectUrl="/"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-zinc-600 text-xs">
        <p>Powered by Gemini AI • Built with React + Clerk</p>
      </div>
    </div>
  );
};

export default LoginScreen;
