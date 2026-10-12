import React from 'react';
import { Globe, Sparkles } from 'lucide-react';

interface AppWatermarkProps {
  variant?: 'floating' | 'inline' | 'diagonal';
  className?: string;
}

export const AppWatermark: React.FC<AppWatermarkProps> = ({
  variant = 'floating',
  className = '',
}) => {
  if (variant === 'diagonal') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden z-0 ${className}`}
      >
        <span className="text-[4rem] sm:text-[6rem] lg:text-[8rem] font-black uppercase tracking-widest text-red-500/[0.04] print:text-red-800/[0.07] transform -rotate-12 whitespace-nowrap">
          loopuniverse.net
        </span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <a
        href="https://loopuniverse.net"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-[11px] font-mono text-red-400/80 hover:text-red-400 transition-colors group ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] group-hover:scale-125 transition-transform animate-pulse" />
        <span>loopuniverse.net</span>
      </a>
    );
  }

  // Default: Sleek floating badge at bottom-left in glowing crimson/red aesthetic
  return (
    <div
      className={`fixed bottom-3 left-4 z-40 select-none print:hidden pointer-events-auto opacity-85 hover:opacity-100 transition-all duration-200 ${className}`}
    >
      <a
        href="https://loopuniverse.net"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#140507]/90 hover:bg-[#20070a] backdrop-blur-md border border-red-500/35 hover:border-red-500/70 text-[10px] font-mono font-medium text-red-200/90 hover:text-white transition-all shadow-lg shadow-red-950/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.45)] group"
        title="Verified via loopuniverse.net"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_6px_#ef4444]" />
        </span>
        <span className="tracking-wider bg-gradient-to-r from-red-200 via-rose-100 to-red-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-red-100 font-semibold">
          loopuniverse.net
        </span>
      </a>
    </div>
  );
};

export default AppWatermark;
