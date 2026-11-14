import React from 'react';
import { PopulationSuitability } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Baby, Activity, Heart, User, Dumbbell, CheckCircle2, XCircle } from 'lucide-react';

interface SuitabilityGridProps {
  suitability: PopulationSuitability;
}

export const SuitabilityGrid: React.FC<SuitabilityGridProps> = ({ suitability }) => {
  const { t } = useTheme();

  const groups = [
    {
      key: 'children',
      title: t.children,
      icon: Baby,
      safe: suitability?.forChildren ?? true,
      notes: suitability?.childrenNotes || '',
    },
    {
      key: 'diabetics',
      title: t.diabetics,
      icon: Activity,
      safe: suitability?.forDiabetics ?? false,
      notes: suitability?.diabeticNotes || '',
    },
    {
      key: 'pregnant',
      title: t.pregnantWomen,
      icon: Heart,
      safe: suitability?.forPregnant ?? true,
      notes: suitability?.pregnantNotes || '',
    },
    {
      key: 'elderly',
      title: t.elderlyPeople,
      icon: User,
      safe: suitability?.forElderly ?? true,
      notes: suitability?.elderlyNotes || '',
    },
    {
      key: 'gym',
      title: t.gymAthletes,
      icon: Dumbbell,
      safe: suitability?.forGym ?? true,
      notes: suitability?.gymNotes || '',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase flex items-center gap-2">
        <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        {t.populationSuitability}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.key}
              className={`p-3 rounded-2xl border transition-all ${
                group.safe
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-xl ${
                      group.safe
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{group.title}</span>
                </div>

                <div className="flex items-center gap-1">
                  {group.safe ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      <CheckCircle2 className="w-3 h-3" /> {t.safe}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/25">
                      <XCircle className="w-3 h-3" /> {t.caution}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                {group.notes}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
