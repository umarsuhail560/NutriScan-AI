import React from 'react';
import { PopulationSuitability } from '../types';
import {
  Baby,
  Activity,
  Heart,
  User,
  Dumbbell,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SuitabilityGridProps {
  suitability: PopulationSuitability;
}

const suitabilityLabels = {
  English: {
    title: 'Population Health Suitability',
    children: 'Children',
    diabetics: 'Diabetics',
    pregnant: 'Pregnant Women',
    elderly: 'Elderly People',
    gym: 'Gym & Athletes',
    safe: 'Suitable',
    caution: 'Caution',
    kidFallback: 'General suitability for children based on the analyzed ingredients.',
    diabeticFallback: 'Consider sugar and carbohydrate content when assessing suitability.',
    pregnantFallback: 'Check ingredients and additives for pregnancy-related concerns.',
    elderlyFallback: 'Consider sodium content and ease of digestion.',
    gymFallback: 'Consider protein and overall macronutrient balance.',
  },

  Spanish: {
    title: 'Adecuación para la salud de la población',
    children: 'Niños',
    diabetics: 'Diabéticos',
    pregnant: 'Mujeres embarazadas',
    elderly: 'Personas mayores',
    gym: 'Gimnasio y atletas',
    safe: 'Adecuado',
    caution: 'Precaución',
    kidFallback: 'Adecuación general para niños según los ingredientes analizados.',
    diabeticFallback: 'Ten en cuenta el contenido de azúcar y carbohidratos.',
    pregnantFallback: 'Revisa los ingredientes y aditivos para posibles riesgos durante el embarazo.',
    elderlyFallback: 'Ten en cuenta el contenido de sodio y la facilidad de digestión.',
    gymFallback: 'Ten en cuenta las proteínas y el equilibrio general de macronutrientes.',
  },

  French: {
    title: 'Adéquation pour la santé de la population',
    children: 'Enfants',
    diabetics: 'Diabétiques',
    pregnant: 'Femmes enceintes',
    elderly: 'Personnes âgées',
    gym: 'Sportifs et athlètes',
    safe: 'Convient',
    caution: 'Prudence',
    kidFallback: 'Adéquation générale pour les enfants selon les ingrédients analysés.',
    diabeticFallback: 'Tenez compte de la teneur en sucre et en glucides.',
    pregnantFallback: 'Vérifiez les ingrédients et additifs pour les risques liés à la grossesse.',
    elderlyFallback: 'Tenez compte du sodium et de la facilité de digestion.',
    gymFallback: 'Tenez compte des protéines et de l’équilibre général des macronutriments.',
  },

  German: {
    title: 'Eignung für die Gesundheit verschiedener Gruppen',
    children: 'Kinder',
    diabetics: 'Diabetiker',
    pregnant: 'Schwangere Frauen',
    elderly: 'Ältere Menschen',
    gym: 'Sportler',
    safe: 'Geeignet',
    caution: 'Vorsicht',
    kidFallback: 'Allgemeine Eignung für Kinder auf Grundlage der analysierten Zutaten.',
    diabeticFallback: 'Achten Sie auf den Zucker- und Kohlenhydratgehalt.',
    pregnantFallback: 'Prüfen Sie Zutaten und Zusatzstoffe auf mögliche Risiken während der Schwangerschaft.',
    elderlyFallback: 'Achten Sie auf den Natriumgehalt und die Verdaulichkeit.',
    gymFallback: 'Achten Sie auf Protein und das allgemeine Makronährstoffgleichgewicht.',
  },

  Hindi: {
    title: 'विभिन्न लोगों के लिए स्वास्थ्य उपयुक्तता',
    children: 'बच्चे',
    diabetics: 'मधुमेह वाले लोग',
    pregnant: 'गर्भवती महिलाएं',
    elderly: 'बुजुर्ग',
    gym: 'जिम और एथलीट',
    safe: 'उपयुक्त',
    caution: 'सावधानी',
    kidFallback: 'विश्लेषण किए गए सामग्री के आधार पर बच्चों के लिए सामान्य उपयुक्तता।',
    diabeticFallback: 'चीनी और कार्बोहाइड्रेट की मात्रा पर ध्यान दें।',
    pregnantFallback: 'गर्भावस्था से जुड़े जोखिमों के लिए सामग्री और एडिटिव्स की जांच करें।',
    elderlyFallback: 'सोडियम की मात्रा और पाचन में आसानी पर ध्यान दें।',
    gymFallback: 'प्रोटीन और मैक्रोन्यूट्रिएंट संतुलन पर ध्यान दें।',
  },

  Arabic: {
    title: 'ملاءمة المنتج لصحة الفئات المختلفة',
    children: 'الأطفال',
    diabetics: 'مرضى السكري',
    pregnant: 'النساء الحوامل',
    elderly: 'كبار السن',
    gym: 'الرياضيون',
    safe: 'مناسب',
    caution: 'تنبيه',
    kidFallback: 'الملاءمة العامة للأطفال بناءً على المكونات التي تم تحليلها.',
    diabeticFallback: 'يجب الانتباه إلى كمية السكر والكربوهيدرات.',
    pregnantFallback: 'تحقق من المكونات والإضافات المتعلقة بمخاطر الحمل.',
    elderlyFallback: 'يجب الانتباه إلى كمية الصوديوم وسهولة الهضم.',
    gymFallback: 'يجب الانتباه إلى البروتين والتوازن العام للعناصر الغذائية.',
  },
} as const;

export const SuitabilityGrid: React.FC<SuitabilityGridProps> = ({
  suitability,
}) => {
  const { language } = useTheme();

  const labels = suitabilityLabels[language];

  const groups = [
    {
      key: 'children',
      title: labels.children,
      icon: Baby,
      safe: suitability?.forChildren ?? true,
      notes: suitability?.childrenNotes || labels.kidFallback,
    },
    {
      key: 'diabetics',
      title: labels.diabetics,
      icon: Activity,
      safe: suitability?.forDiabetics ?? false,
      notes: suitability?.diabeticNotes || labels.diabeticFallback,
    },
    {
      key: 'pregnant',
      title: labels.pregnant,
      icon: Heart,
      safe: suitability?.forPregnant ?? true,
      notes: suitability?.pregnantNotes || labels.pregnantFallback,
    },
    {
      key: 'elderly',
      title: labels.elderly,
      icon: User,
      safe: suitability?.forElderly ?? true,
      notes: suitability?.elderlyNotes || labels.elderlyFallback,
    },
    {
      key: 'gym',
      title: labels.gym,
      icon: Dumbbell,
      safe: suitability?.forGym ?? true,
      notes: suitability?.gymNotes || labels.gymFallback,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase flex items-center gap-2">
        <Activity className="w-4 h-4 text-emerald-400" />
        {labels.title}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {groups.map((group) => {
          const Icon = group.icon;

          return (
            <div
              key={group.key}
              className={`p-3 rounded-2xl border transition-all ${
                group.safe
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-xl ${
                      group.safe
                        ? 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                        : 'bg-rose-500/20 text-rose-500 dark:text-rose-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {group.title}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {group.safe ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {labels.safe}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <XCircle className="w-3 h-3" />
                      {labels.caution}
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