import React, { useState } from 'react';

interface TrendPoint {
  month: string;
  score: number;
}

interface NativeTrendChartProps {
  data: TrendPoint[];
  height?: number;
}

export const NativeTrendChart: React.FC<NativeTrendChartProps> = ({ data, height = 210 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs font-medium">
        No performance points recorded yet.
      </div>
    );
  }

  const safeData = data.length === 1 ? [{ month: 'Start', score: 0 }, ...data] : data;

  const width = 600;
  const paddingLeft = 35;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const points = safeData.map((d, i) => {
    const x = paddingLeft + (i / (safeData.length - 1)) * chartW;
    const clampedScore = Math.max(0, Math.min(100, d.score ?? 0));
    const y = paddingTop + chartH - (clampedScore / 100) * chartH;
    return { x, y, score: clampedScore, month: d.month };
  });

  // Generate smooth SVG curve path
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const baselineY = paddingTop + chartH;
  const areaPath = `${linePath} L ${lastPt.x} ${baselineY} L ${firstPt.x} ${baselineY} Z`;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full relative select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="nativeScoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff7800" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#ff7800" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ff7800" stopOpacity="0.0" />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ff7800" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map((tick) => {
          const y = paddingTop + chartH - (tick / 100) * chartH;
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#132247"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="inherit"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Shaded Area fill */}
        <path d={areaPath} fill="url(#nativeScoreGradient)" />

        {/* Primary Glowing Score Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#ff7800"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowEffect)"
        />

        {/* Data points & hover triggers */}
        {points.map((pt, i) => (
          <g
            key={i}
            className="cursor-pointer transition-transform"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Outer hover ring */}
            {hoveredIdx === i && (
              <circle cx={pt.x} cy={pt.y} r="8" fill="#ff7800" fillOpacity="0.3" />
            )}
            {/* Solid dot */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? 5.5 : 4}
              fill={hoveredIdx === i ? '#ffffff' : '#ff7800'}
              stroke="#091438"
              strokeWidth="2.5"
            />
            {/* X-Axis Month label */}
            <text
              x={pt.x}
              y={baselineY + 18}
              fill={hoveredIdx === i ? '#ffffff' : '#64748b'}
              fontSize="10"
              fontWeight={hoveredIdx === i ? 'bold' : 'normal'}
              textAnchor="middle"
              fontFamily="inherit"
            >
              {pt.month}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating Tooltip Pill */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-lg bg-[#070f2b] border border-brand-orange text-white text-[11px] font-bold shadow-xl flex items-center gap-1.5 z-20"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
            marginTop: '-8px',
          }}
        >
          <span className="text-slate-300 font-normal">{points[hoveredIdx].month}:</span>
          <span className="text-brand-orange">{points[hoveredIdx].score}%</span>
        </div>
      )}
    </div>
  );
};

export default NativeTrendChart;
