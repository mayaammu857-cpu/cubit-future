import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AppWatermarkProps {
  variant?: 'global' | 'floating' | 'inline' | 'diagonal' | 'pattern';
  className?: string;
}

export const AppWatermark: React.FC<AppWatermarkProps> = ({
  variant = 'global',
  className = '',
}) => {
  // 1. Diagonal Watermark (Used for ID cards, Progress cards, Modals, Printable certificates)
  if (variant === 'diagonal') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden z-0 ${className}`}
      >
        <span className="text-[3.5rem] sm:text-[5.5rem] lg:text-[7.5rem] font-black uppercase tracking-widest text-red-500/[0.045] dark:text-red-500/[0.055] print:text-red-800/[0.09] transform -rotate-12 whitespace-nowrap">
          loopuniverse.net
        </span>
      </div>
    );
  }

  // 2. Inline Watermark (Used inside footers, badges, modal corners)
  if (variant === 'inline') {
    return (
      <a
        href="https://loopuniverse.net"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-[11px] font-mono text-red-400/90 hover:text-red-300 transition-colors group ${className}`}
        title="Verified by loopuniverse.net"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] group-hover:scale-125 transition-transform animate-pulse" />
        <span className="font-semibold tracking-wide">loopuniverse.net</span>
      </a>
    );
  }

  // 3. Repeating Pattern Watermark
  if (variant === 'pattern') {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      >
        <svg
          className="w-full h-full opacity-[0.035] dark:opacity-[0.04] print:opacity-[0.085] text-red-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="loopuniverse-pattern-standalone"
              width="280"
              height="140"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-22)"
            >
              <text
                x="20"
                y="75"
                fill="currentColor"
                fontSize="15"
                fontWeight="800"
                letterSpacing="0.18em"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              >
                LOOPUNIVERSE.NET
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loopuniverse-pattern-standalone)" />
        </svg>
      </div>
    );
  }

  // Floating Badge Component (Interactive, fixed, glowing, high z-index)
  const floatingBadge = (
    <div
      className={`fixed bottom-3.5 left-4 sm:left-6 z-[99999] select-none print:hidden pointer-events-auto transition-transform duration-200 hover:scale-105 ${className}`}
    >
      <a
        href="https://loopuniverse.net"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#100406]/92 hover:bg-[#1e0509] backdrop-blur-md border border-red-500/40 hover:border-red-500 text-[11px] font-mono font-medium text-red-200 hover:text-white transition-all shadow-xl shadow-red-950/40 hover:shadow-[0_0_22px_rgba(239,68,68,0.55)] group"
        title="Verified & Secured by loopuniverse.net"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_#ef4444]" />
        </span>
        <span className="tracking-wider bg-gradient-to-r from-red-200 via-rose-100 to-red-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-red-100 font-semibold">
          loopuniverse.net
        </span>
        <ExternalLink className="w-3 h-3 text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>
  );

  if (variant === 'floating') {
    return floatingBadge;
  }

  // 4. Default / Global: Full-page repeating SVG watermark across the ENTIRE viewport + floating interactive badge + print watermark
  return (
    <>
      {/* Universal Background Repeating Security Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none print:opacity-100"
      >
        <svg
          className="w-full h-full opacity-[0.032] dark:opacity-[0.038] print:opacity-[0.085] text-red-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="loopuniverse-watermark-global"
              width="300"
              height="150"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-22)"
            >
              <text
                x="20"
                y="80"
                fill="currentColor"
                fontSize="15"
                fontWeight="800"
                letterSpacing="0.2em"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              >
                LOOPUNIVERSE.NET
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loopuniverse-watermark-global)" />
        </svg>
      </div>

      {/* Print-only Center Watermark for Reports & Certificates */}
      <div
        aria-hidden="true"
        className="hidden print:flex pointer-events-none fixed inset-0 items-center justify-center select-none overflow-hidden z-[9999]"
      >
        <span className="text-[6rem] font-black uppercase tracking-widest text-red-900/[0.08] transform -rotate-25 whitespace-nowrap">
          loopuniverse.net
        </span>
      </div>

      {/* Floating Interactive Badge */}
      {floatingBadge}
    </>
  );
};

export default AppWatermark;
