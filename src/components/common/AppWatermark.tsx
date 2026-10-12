import React from 'react';

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

  if (variant === 'floating') {
    return null;
  }

  // 4. Default / Global: Full-page repeating SVG watermark across the ENTIRE viewport + print watermark
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
    </>
  );
};

export default AppWatermark;
