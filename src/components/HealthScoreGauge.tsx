import React from 'react';
import { GradeType, RiskLevelType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HealthScoreGaugeProps {
  score: number;
  grade: GradeType;
  riskLevel: RiskLevelType;
  size?: number;
}

const riskLabels = {
  English: {
    outOf100: 'Out of 100',
    grade: 'Grade',
    veryHealthy: 'Very Healthy',
    healthy: 'Healthy',
    moderate: 'Moderate',
    unhealthy: 'Unhealthy',
    avoidFrequently: 'Avoid Frequently',
  },

  Spanish: {
    outOf100: 'De 100',
    grade: 'Grado',
    veryHealthy: 'Muy saludable',
    healthy: 'Saludable',
    moderate: 'Moderado',
    unhealthy: 'No saludable',
    avoidFrequently: 'Evitar con frecuencia',
  },

  French: {
    outOf100: 'Sur 100',
    grade: 'Note',
    veryHealthy: 'Très sain',
    healthy: 'Sain',
    moderate: 'Modéré',
    unhealthy: 'Peu sain',
    avoidFrequently: 'À éviter fréquemment',
  },

  German: {
    outOf100: 'Von 100',
    grade: 'Note',
    veryHealthy: 'Sehr gesund',
    healthy: 'Gesund',
    moderate: 'Mäßig',
    unhealthy: 'Ungesund',
    avoidFrequently: 'Häufig vermeiden',
  },

  Hindi: {
    outOf100: '100 में से',
    grade: 'ग्रेड',
    veryHealthy: 'बहुत स्वस्थ',
    healthy: 'स्वस्थ',
    moderate: 'मध्यम',
    unhealthy: 'अस्वस्थ',
    avoidFrequently: 'अक्सर बचें',
  },

  Arabic: {
    outOf100: 'من 100',
    grade: 'التقييم',
    veryHealthy: 'صحي جدًا',
    healthy: 'صحي',
    moderate: 'متوسط',
    unhealthy: 'غير صحي',
    avoidFrequently: 'يُنصح بتجنبه بشكل متكرر',
  },
} as const;

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  grade,
  riskLevel,
  size = 180,
}) => {
  const { language } = useTheme();

  const labels = riskLabels[language];

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeScore = Math.max(0, Math.min(100, score));

  const strokeDashoffset =
    circumference - (safeScore / 100) * circumference;

  const getColorConfig = (val: number) => {
    if (val >= 80) {
      return {
        stroke: '#10B981',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    }

    if (val >= 60) {
      return {
        stroke: '#84CC16',
        bg: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
      };
    }

    if (val >= 40) {
      return {
        stroke: '#F59E0B',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    }

    if (val >= 20) {
      return {
        stroke: '#F97316',
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      };
    }

    return {
      stroke: '#EF4444',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    };
  };

  const config = getColorConfig(safeScore);

  const translatedRiskLevel =
    riskLevel === 'Very Healthy'
      ? labels.veryHealthy
      : riskLevel === 'Healthy'
        ? labels.healthy
        : riskLevel === 'Moderate'
          ? labels.moderate
          : riskLevel === 'Unhealthy'
            ? labels.unhealthy
            : labels.avoidFrequently;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
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
            {safeScore}
          </span>

          <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
            {labels.outOf100}
          </span>
        </div>
      </div>

      {/* Grade & Risk Pills */}
      <div className="mt-4 flex items-center gap-2">
        <span className="px-3 py-1 rounded-xl font-black text-sm bg-slate-100 dark:bg-slate-800 text-emerald-500 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-sm">
          {labels.grade} {grade}
        </span>

        <span
          className={`px-3 py-1 rounded-xl text-xs font-bold border ${config.bg}`}
        >
          {translatedRiskLevel}
        </span>
      </div>
    </div>
  );
};