import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTheme } from '../context/ThemeContext';

interface NutritionPieChartProps {
  protein: string;
  fat: string;
  carbs: string;
  sugar: string;
}

export const NutritionPieChart: React.FC<NutritionPieChartProps> = ({
  protein,
  fat,
  carbs,
  sugar,
}) => {
  const { theme, t } = useTheme();
  const isDark = theme === 'dark';

  const parseNum = (val: string) => {
    const matched = val ? val.match(/[\d.]+/) : null;
    return matched ? parseFloat(matched[0]) : 0;
  };

  const p = parseNum(protein);
  const f = parseNum(fat);
  const c = parseNum(carbs);
  const s = parseNum(sugar);

  const data = [
    { name: t.carbohydrates, value: c, color: '#3B82F6' },
    { name: t.protein, value: p, color: '#10B981' },
    { name: t.fat, value: f, color: '#F59E0B' },
    { name: t.sugar, value: s, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <div className="text-xs text-slate-500 text-center py-4">{t.noMacroData}</div>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={isDark ? '#0F172A' : '#FFFFFF'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderRadius: '12px',
                color: isDark ? '#F8FAFC' : '#0F172A',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value}g`, t.amount]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs w-full max-w-xs mt-1">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50"
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{item.name}:</span>
            <span className="text-slate-900 dark:text-white font-bold ml-auto">{item.value}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};
