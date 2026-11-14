import { FoodScan } from '../types';
import { Translations, translateDietaryOption } from '../i18n/translations';

export function parseNutrientGrams(val?: string): number {
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '.').trim();
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (Number.isNaN(num)) return 0;
  if (/mg/i.test(cleaned)) {
    return num / 1000;
  }
  return num;
}

export function parseCalories(val?: string): number {
  if (!val) return 0;
  const match = String(val).replace(/,/g, '.').match(/(\d+(?:\.\d+)?)/);
  return match ? Math.round(parseFloat(match[1])) : 0;
}

export interface DailyReferenceItem {
  key: 'calories' | 'sugar' | 'salt' | 'fat' | 'protein' | 'fiber';
  label: string;
  rawValue: string;
  numeric: number;
  dailyLimit: number;
  unit: string;
  percent: number;
  statusText: string;
  barColor: string;
  textColor: string;
}

export function buildDailyReferences(scan: FoodScan, t: Translations): DailyReferenceItem[] {
  const cal = parseCalories(scan.calories);
  const sugar = parseNutrientGrams(scan.sugar);
  const salt = parseNutrientGrams(scan.salt);
  const fat = parseNutrientGrams(scan.fat);
  const protein = parseNutrientGrams(scan.protein);
  const fiber = parseNutrientGrams(scan.fiber);

  const items: DailyReferenceItem[] = [
    {
      key: 'calories',
      label: t.calories,
      rawValue: scan.calories || '0 kcal',
      numeric: cal,
      dailyLimit: 2000,
      unit: 'kcal',
      percent: Math.min(100, Math.round((cal / 2000) * 100)),
      statusText: cal > 450 ? t.statusHigh : cal > 220 ? t.statusModerate : t.statusLow,
      barColor: cal > 450 ? 'bg-amber-500' : 'bg-emerald-500',
      textColor: cal > 450 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'sugar',
      label: t.sugar,
      rawValue: scan.sugar || '0g',
      numeric: sugar,
      dailyLimit: 25,
      unit: 'g',
      percent: Math.min(100, Math.round((sugar / 25) * 100)),
      statusText: sugar > 12 ? t.statusHigh : sugar > 5 ? t.statusModerate : t.statusLow,
      barColor: sugar > 12 ? 'bg-rose-500' : sugar > 5 ? 'bg-amber-500' : 'bg-emerald-500',
      textColor: sugar > 12 ? 'text-rose-600 dark:text-rose-400' : sugar > 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'salt',
      label: t.salt,
      rawValue: scan.salt || '0g',
      numeric: salt,
      dailyLimit: 6,
      unit: 'g',
      percent: Math.min(100, Math.round((salt / 6) * 100)),
      statusText: salt > 1.5 ? t.statusHigh : salt > 0.6 ? t.statusModerate : t.statusLow,
      barColor: salt > 1.5 ? 'bg-rose-500' : salt > 0.6 ? 'bg-amber-500' : 'bg-emerald-500',
      textColor: salt > 1.5 ? 'text-rose-600 dark:text-rose-400' : salt > 0.6 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'fat',
      label: t.fat,
      rawValue: scan.fat || '0g',
      numeric: fat,
      dailyLimit: 70,
      unit: 'g',
      percent: Math.min(100, Math.round((fat / 70) * 100)),
      statusText: fat > 17.5 ? t.statusHigh : fat > 7 ? t.statusModerate : t.statusLow,
      barColor: fat > 17.5 ? 'bg-orange-500' : fat > 7 ? 'bg-amber-500' : 'bg-emerald-500',
      textColor: fat > 17.5 ? 'text-orange-600 dark:text-orange-400' : fat > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'protein',
      label: t.protein,
      rawValue: scan.protein || '0g',
      numeric: protein,
      dailyLimit: 50,
      unit: 'g',
      percent: Math.min(100, Math.round((protein / 50) * 100)),
      statusText: protein >= 10 ? t.statusGood : protein >= 4 ? t.statusModerate : t.statusLow,
      barColor: protein >= 10 ? 'bg-emerald-500' : 'bg-teal-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      key: 'fiber',
      label: t.fiber,
      rawValue: scan.fiber || '0g',
      numeric: fiber,
      dailyLimit: 28,
      unit: 'g',
      percent: Math.min(100, Math.round((fiber / 28) * 100)),
      statusText: fiber >= 5 ? t.statusGood : fiber >= 2 ? t.statusModerate : t.statusLow,
      barColor: fiber >= 5 ? 'bg-emerald-500' : 'bg-cyan-500',
      textColor: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return items;
}

export interface DietaryMatchResult {
  key: string;
  label: string;
  compatible: boolean;
}

export function evaluateDietaryMatches(scan: FoodScan, prefs: string[], t: Translations): DietaryMatchResult[] {
  if (!Array.isArray(prefs) || prefs.length === 0) return [];

  const textBlob = [
    ...(scan.ingredients || []),
    ...(scan.allergens || []),
    ...(scan.warnings || []),
    ...(scan.badPoints || []),
    scan.summary || '',
  ]
    .join(' ')
    .toLowerCase();

  const sugar = parseNutrientGrams(scan.sugar);
  const carbs = parseNutrientGrams(scan.carbohydrates);
  const salt = parseNutrientGrams(scan.salt);

  return prefs.map((pref) => {
    let compatible = true;

    if (pref === 'Diabetic-Friendly') {
      compatible = Boolean(scan.suitability?.forDiabetics) && sugar <= 8;
    } else if (pref === 'Vegan') {
      const nonVeganTerms = ['milk', 'whey', 'casein', 'egg', 'meat', 'beef', 'chicken', 'pork', 'fish', 'gelatin', 'honey', 'butter', 'cheese', 'lactose', 'dairy'];
      compatible = !nonVeganTerms.some((term) => textBlob.includes(term));
    } else if (pref === 'Gluten-Free') {
      const glutenTerms = ['wheat', 'barley', 'rye', 'gluten', 'malt', 'spelt', 'farro'];
      compatible = !glutenTerms.some((term) => textBlob.includes(term));
    } else if (pref === 'Nut-Free') {
      const nutTerms = ['peanut', 'almond', 'cashew', 'walnut', 'hazelnut', 'pecan', 'pistachio', 'tree nut', 'nuts'];
      compatible = !nutTerms.some((term) => textBlob.includes(term));
    } else if (pref === 'Low-Sodium') {
      compatible = salt <= 0.6;
    } else if (pref === 'Pregnancy-Safe') {
      compatible = Boolean(scan.suitability?.forPregnant);
    } else if (pref === 'Keto-Friendly') {
      compatible = carbs <= 10 && sugar <= 4;
    }

    return {
      key: pref,
      label: translateDietaryOption(pref, t),
      compatible,
    };
  });
}
