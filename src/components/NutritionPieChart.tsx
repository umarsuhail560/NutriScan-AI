import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

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
  const parseNum = (val: string) => {
    const matched = val ? val.match(/[\d.]+/) : null;
    return matched ? parseFloat(matched[0]) : 0;
  };

  const p = parseNum(protein);
  const f = parseNum(fat);
  const c = parseNum(carbs);
  const s = parseNum(sugar);

  const data = [
    { name: 'Carbohydrates', value: c, color: '#3B82F6' },
    { name: 'Protein', value: p, color: '#10B981' },
    { name: 'Fat', value: f, color: '#F59E0B' },
    { name: 'Sugar', value: s, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <div className="text-xs text-slate-500 text-center py-4">No macro distribution data</div>;
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
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#F8FAFC',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value}g`, 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs w-full max-w-xs mt-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-300 font-medium">{item.name}:</span>
            <span className="text-white font-bold ml-auto">{item.value}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};
