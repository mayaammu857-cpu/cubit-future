import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    isPositive: boolean;
    label?: string;
  };
  highlightOrange?: boolean;
  colorScheme?: 'navy' | 'orange' | 'emerald' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlightOrange = false,
  colorScheme = 'navy',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border ${
        highlightOrange
          ? 'bg-gradient-to-br from-white to-orange-50/50 border-brand-orange/40 shadow-lg shadow-brand-orange/10 ring-1 ring-brand-orange/20'
          : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Top row: Icon and Trend badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-105 ${
            highlightOrange
              ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/30'
              : colorScheme === 'orange'
              ? 'bg-orange-100 text-brand-orange'
              : colorScheme === 'emerald'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-brand-navy text-white shadow-sm'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {trend && (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Main Metric & Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          {title}
        </p>
        <h3
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            highlightOrange ? 'text-brand-orange' : 'text-brand-navy'
          }`}
        >
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Accent corner bar if highlighted */}
      {highlightOrange && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-orange/20 to-transparent pointer-events-none rounded-bl-3xl" />
      )}
    </div>
  );
};
