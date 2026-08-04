import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Shield,
  Info,
  MessageSquare,
  LogOut,
  Check,
  Sparkles,
  Heart,
  ChevronRight,
  Send,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const { logout } = useAuth();

  const [dietary, setDietary] = useState<string[]>(() => {
    const saved = localStorage.getItem('nutriscan_dietary');
    return saved ? JSON.parse(saved) : ['Diabetic-Friendly', 'Low-Sodium'];
  });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const toggleDietary = (item: string) => {
    const updated = dietary.includes(item)
      ? dietary.filter((d) => d !== item)
      : [...dietary, item];
    setDietary(updated);
    localStorage.setItem('nutriscan_dietary', JSON.stringify(updated));
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic'];
  const dietaryOptions = [
    'Diabetic-Friendly',
    'Vegan',
    'Gluten-Free',
    'Nut-Free',
    'Low-Sodium',
    'Pregnancy-Safe',
    'Keto-Friendly',
  ];

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setShowFeedbackModal(false);
      setFeedbackText('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold font-['Outfit']">Preferences & Settings</h2>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Appearance & Theme */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appearance</h3>
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <div>
                <span className="text-xs font-bold text-white block">Theme Mode</span>
                <span className="text-[10px] text-slate-400">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Toggle Theme
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" /> Language
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                  language === lang
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{lang}</span>
                {language === lang && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Profile Filters */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" /> Dietary Preferences
          </h3>
          <p className="text-[11px] text-slate-400">
            Selected preferences are prioritized during Gemini AI food risk evaluation.
          </p>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((opt) => {
              const active = dietary.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleDietary(opt)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Support & Legal */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About & Legal</h3>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="w-full p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" /> Send Feedback & Suggestions
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400" /> Privacy & Encryption
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              NutriScan AI stores scan history securely in Firebase Firestore. Your images are analyzed server-side with zero data monetization.
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Info className="w-4 h-4 text-amber-400" /> About NutriScan AI v2.5
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Powered by Google Gemini 2.5 Flash AI and Open Food Facts international barcode repository.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" /> Send App Feedback
            </h3>
            {feedbackSent ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 text-center font-bold">
                Thank you for your feedback! NutriScan AI is constantly improving.
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3">
                <textarea
                  required
                  rows={4}
                  placeholder="Share your thoughts or feature requests..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
