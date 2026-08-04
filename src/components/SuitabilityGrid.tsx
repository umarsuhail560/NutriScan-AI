import React from 'react';
import { PopulationSuitability } from '../types';
import { Baby, Activity, Heart, User, Dumbbell, CheckCircle2, XCircle } from 'lucide-react';

interface SuitabilityGridProps {
  suitability: PopulationSuitability;
}

export const SuitabilityGrid: React.FC<SuitabilityGridProps> = ({ suitability }) => {
  const groups = [
    {
      key: 'children',
      title: 'Children',
      icon: Baby,
      safe: suitability?.forChildren ?? true,
      notes: suitability?.childrenNotes || 'General kid consumption suitability.',
    },
    {
      key: 'diabetics',
      title: 'Diabetics',
      icon: Activity,
      safe: suitability?.forDiabetics ?? false,
      notes: suitability?.diabeticNotes || 'Glycemic index and sugar safety.',
    },
    {
      key: 'pregnant',
      title: 'Pregnant Women',
      icon: Heart,
      safe: suitability?.forPregnant ?? true,
      notes: suitability?.pregnantNotes || 'Additive and caffeine warnings.',
    },
    {
      key: 'elderly',
      title: 'Elderly People',
      icon: User,
      safe: suitability?.forElderly ?? true,
      notes: suitability?.elderlyNotes || 'Sodium and digestibility notes.',
    },
    {
      key: 'gym',
      title: 'Gym & Athletes',
      icon: Dumbbell,
      safe: suitability?.forGym ?? true,
      notes: suitability?.gymNotes || 'Protein and macro balance.',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase flex items-center gap-2">
        <Activity className="w-4 h-4 text-emerald-400" />
        Population & Health Suitability
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div
              key={group.key}
              className={`p-3 rounded-2xl border transition-all ${
                group.safe
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-xl ${
                      group.safe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">{group.title}</span>
                </div>

                <div className="flex items-center gap-1">
                  {group.safe ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Safe
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <XCircle className="w-3 h-3" /> Caution
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed pl-1">
                {group.notes}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
