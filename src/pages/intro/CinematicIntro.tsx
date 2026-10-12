import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const CinematicIntro: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);   // "Your Goals."
    const t2 = setTimeout(() => setStep(2), 2200);  // "Our Guidance."
    const t3 = setTimeout(() => setStep(3), 3600);  // "A Brighter Future."
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
      else navigate('/login');
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [navigate, onComplete]);

  const handleSkip = () => {
    if (onComplete) onComplete();
    else navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080B18] text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none">
      {/* Ambient Lighting & Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#172B80]/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#FF9500]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/cubit_future_logo.png"
            alt="Cubit Future"
            className="h-11 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,149,0,0.3)] animate-pulse"
          />
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Center Cinematic Composition */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
        {/* Visual Silhouette & Glowing Golden Doorway Canvas */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-8 flex items-center justify-center">
          {/* Golden Portal Doorway */}
          <div className="w-28 sm:w-32 h-52 sm:h-56 rounded-t-full border-2 border-[#FF9500] bg-gradient-to-t from-[#FF9500]/40 via-[#FF9500]/10 to-transparent shadow-[0_0_60px_rgba(255,149,0,0.6)] relative flex flex-col justify-end items-center overflow-hidden">
            {/* Inner radiant doorway light rays */}
            <div className="w-full h-full bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-60" />

            {/* Illuminated Staircase */}
            <div className="w-full space-y-1.5 pb-2 px-3 opacity-90">
              <div className="h-1 bg-gradient-to-r from-transparent via-[#FF9500] to-transparent w-full rounded" />
              <div className="h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent w-4/5 mx-auto rounded" />
              <div className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent w-3/5 mx-auto rounded" />
              <div className="h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent w-2/5 mx-auto rounded" />
            </div>

            {/* Student Silhouette */}
            <div className="absolute bottom-6 w-7 h-14 bg-[#080B18] rounded-t-full shadow-lg border-t border-[#FF9500]/40 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#080B18] border border-[#FF9500]/50 -mt-2" />
            </div>
          </div>

          {/* Electric Blue Circular Energy Halo */}
          <div className="absolute inset-0 rounded-full border border-[#172B80]/40 animate-spin-slow pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-dashed border-[#172B80]/30 pointer-events-none" />
        </div>

        {/* 3-Step Inspiring Slogans with Smooth Fade */}
        <div className="min-h-[140px] flex flex-col items-center justify-center space-y-3">
          <p
            className={`text-2xl sm:text-4xl font-extrabold tracking-tight transition-all duration-700 transform ${
              step >= 1 ? 'opacity-100 translate-y-0 text-slate-100' : 'opacity-0 translate-y-4'
            }`}
          >
            "Your Goals."
          </p>

          <p
            className={`text-2xl sm:text-4xl font-extrabold tracking-tight transition-all duration-700 transform ${
              step >= 2 ? 'opacity-100 translate-y-0 text-blue-300' : 'opacity-0 translate-y-4'
            }`}
          >
            "Our Guidance."
          </p>

          <p
            className={`text-3xl sm:text-5xl font-black tracking-tight transition-all duration-700 transform ${
              step >= 3
                ? 'opacity-100 translate-y-0 text-transparent bg-clip-text bg-gradient-to-r from-[#FF9500] via-amber-300 to-[#FF9500] drop-shadow-[0_0_25px_rgba(255,149,0,0.5)]'
                : 'opacity-0 translate-y-4'
            }`}
          >
            "A Brighter Future."
          </p>
        </div>

        {/* Sub-label */}
        <div className="pt-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#172B80]/30 border border-[#172B80]/60 text-xs font-semibold text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9500]" />
            Digital Progress Card &amp; Study Plan Management System
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-500">
        Cubit Future Academy • Empowering Aspirants with Guided Mentorship
      </footer>
    </div>
  );
};

export default CinematicIntro;
