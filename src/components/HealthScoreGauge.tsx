import React from 'react';
import { GradeType, RiskLevelType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { translateRiskLevel } from '../i18n/translations';

interface HealthScoreGaugeProps {
  score: number;
  grade: GradeType;
  riskLevel: RiskLevelType;
  size?: number;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  grade,
  riskLevel,
  size = 180,
}) => {
  const { t } = useTheme();
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColorConfig = (val: number) => {
    if (val >= 80) return { stroke: '#10B981', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };
    if (val >= 60) return { stroke: '#84CC16', bg: 'bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-500/30' };
    if (val >= 40) return { stroke: '#F59E0B', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30' };
    if (val >= 20) return { stroke: '#F97316', bg: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30' };
    return { stroke: '#EF4444', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30' };
  };

  const config = getColorConfig(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={config.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white tracking-tight">
            {score}
          </span>
          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            {t.outOf100}
          </span>
        </div>
      </div>

      {/* Grade & Risk Pills */}
      <div className="mt-4 flex items-center gap-2">
        <span className="px-3 py-1 rounded-xl font-black text-sm bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-sm">
          {t.grade} {grade}
        </span>
        <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${config.bg}`}>
          {translateRiskLevel(riskLevel, t)}
        </span>
      </div>
    </div>
  );
};
