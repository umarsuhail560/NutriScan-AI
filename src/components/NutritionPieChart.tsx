import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTheme } from '../context/ThemeContext';

interface NutritionPieChartProps {
  protein: string;
  fat: string;
  carbs: string;
  sugar: string;
}

const chartLabels = {
  English: {
    carbohydrates: 'Carbohydrates',
    protein: 'Protein',
    fat: 'Fat',
    sugar: 'Sugar',
    amount: 'Amount',
    noData: 'No macro distribution data available.',
  },

  Spanish: {
    carbohydrates: 'Carbohidratos',
    protein: 'Proteína',
    fat: 'Grasa',
    sugar: 'Azúcar',
    amount: 'Cantidad',
    noData: 'No hay datos disponibles sobre la distribución de macronutrientes.',
  },

  French: {
    carbohydrates: 'Glucides',
    protein: 'Protéines',
    fat: 'Lipides',
    sugar: 'Sucre',
    amount: 'Quantité',
    noData: 'Aucune donnée disponible sur la répartition des macronutriments.',
  },

  German: {
    carbohydrates: 'Kohlenhydrate',
    protein: 'Protein',
    fat: 'Fett',
    sugar: 'Zucker',
    amount: 'Menge',
    noData: 'Keine Daten zur Makronährstoffverteilung verfügbar.',
  },

  Hindi: {
    carbohydrates: 'कार्बोहाइड्रेट',
    protein: 'प्रोटीन',
    fat: 'वसा',
    sugar: 'चीनी',
    amount: 'मात्रा',
    noData: 'मैक्रोन्यूट्रिएंट वितरण का डेटा उपलब्ध नहीं है।',
  },

  Arabic: {
    carbohydrates: 'الكربوهيدرات',
    protein: 'البروتين',
    fat: 'الدهون',
    sugar: 'السكر',
    amount: 'الكمية',
    noData: 'لا تتوفر بيانات عن توزيع العناصر الغذائية.',
  },
} as const;

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export const NutritionPieChart: React.FC<NutritionPieChartProps> = ({
  protein,
  fat,
  carbs,
  sugar,
}) => {
  const { theme, language } = useTheme();

  const labels = chartLabels[language];

  const parseNum = (val: string) => {
    const matched = val ? val.match(/[\d.]+/) : null;
    return matched ? parseFloat(matched[0]) : 0;
  };

  const p = parseNum(protein);
  const f = parseNum(fat);
  const c = parseNum(carbs);
  const s = parseNum(sugar);

  const data: ChartDataItem[] = [
    {
      name: labels.carbohydrates,
      value: c,
      color: '#3B82F6',
    },
    {
      name: labels.protein,
      value: p,
      color: '#10B981',
    },
    {
      name: labels.fat,
      value: f,
      color: '#F59E0B',
    },
    {
      name: labels.sugar,
      value: s,
      color: '#EF4444',
    },
  ].filter((item) => item.value > 0);

  /*
   * If nutrition information is unavailable,
   * do not create a fake chart from zero values.
   */
  if (data.length === 0) {
    return (
      <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
        {labels.noData}
      </div>
    );
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
                  stroke={theme === 'dark' ? '#0F172A' : '#FFFFFF'}
                  strokeWidth={2}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor:
                  theme === 'dark' ? '#1E293B' : '#FFFFFF',
                borderColor:
                  theme === 'dark' ? '#334155' : '#CBD5E1',
                borderRadius: '12px',
                color:
                  theme === 'dark' ? '#F8FAFC' : '#0F172A',
                fontSize: '12px',
              }}
              formatter={(value) => [
                `${Number(value ?? 0)}g`,
                labels.amount,
              ]}
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
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {item.name}:
            </span>

            <span className="text-slate-900 dark:text-white font-bold ml-auto">
              {item.value}g
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};