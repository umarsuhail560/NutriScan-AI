import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePWAInstall } from '../context/PWAContext';
import { AI_VOICES, useSpeech } from '../context/SpeechContext';
import {
  fetchMyFeedback,
  getEffectiveSenderIdentity,
  submitUserFeedback,
} from '../services/feedbackService';
import { FeedbackItem } from '../types';
import { DIETARY_KEYS, LANGUAGE_META, SupportedLanguage, translateDietaryOption } from '../i18n/translations';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Shield,
  Info,
  MessageSquare,
  Check,
  Heart,
  ChevronRight,
  Send,
  Volume2,
  Square,
  Smartphone,
  Download,
  GraduationCap,
  Cpu,
  UserCheck,
  Loader2,
  X,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userProfile, isGuest, isLocalEmailAuth } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const {
    selectedVoiceId,
    setSelectedVoiceId,
    speechRate,
    setSpeechRate,
    deviceVoices,
    isSpeaking,
    isLoadingAudio,
    speak,
    stop,
  } = useSpeech();

  const [dietary, setDietary] = useState<string[]>(() => {
    const saved = localStorage.getItem('nutriscan_dietary');
    return saved ? JSON.parse(saved) : ['Diabetic-Friendly', 'Low-Sodium'];
  });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const senderIdentity = getEffectiveSenderIdentity(userProfile, isGuest, isLocalEmailAuth);

  useEffect(() => {
    let active = true;
    fetchMyFeedback(senderIdentity.senderUid)
      .then((items) => {
        if (active) setMyFeedback(items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [senderIdentity.senderUid]);

  const toggleDietary = (item: string) => {
    const updated = dietary.includes(item)
      ? dietary.filter((d) => d !== item)
      : [...dietary, item];
    setDietary(updated);
    localStorage.setItem('nutriscan_dietary', JSON.stringify(updated));
  };

  const languages: SupportedLanguage[] = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic'];

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || submittingFeedback) return;
    setSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      const saved = await submitUserFeedback({
        ...senderIdentity,
        message: feedbackText.trim(),
      });
      setMyFeedback((prev) => [saved, ...prev]);
      setFeedbackSent(true);
      setTimeout(() => {
        setFeedbackSent(false);
        setShowFeedbackModal(false);
        setFeedbackText('');
      }, 1500);
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleAddToHomeScreen = async () => {
    if (isInstalled) return;
    if (isInstallable) {
      const ok = await installApp();
      if (!ok) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const speedOptions = [
    { value: 0.8, label: t.speedSlow },
    { value: 1.0, label: t.speedNormal },
    { value: 1.15, label: t.speedFast },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-10 transition-colors">
      {/* Top Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/80 sticky top-16 z-30 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold font-['Outfit']">{t.preferencesSettings}</h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Appearance, Language, Dietary & Add to Home Screen */}
          <div className="lg:col-span-6 space-y-6">
            {/* Appearance & Theme */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.appearance}</h3>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{t.themeMode}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {theme === 'dark' ? t.darkMode : t.lightMode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  {t.toggleTheme}
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.languageLabel}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                      language === lang
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span>{LANGUAGE_META[lang].nativeName}</span>
                    {language === lang && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Profile Filters */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" /> {t.dietaryPreferences}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.dietaryDesc}
              </p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_KEYS.map((opt) => {
                  const active = dietary.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleDietary(opt)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      <span>{translateDietaryOption(opt, t)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to Home Screen (PWA Install) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.addToHomeScreen}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.addToHomeScreenDesc}
              </p>
              {isInstalled ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>{t.alreadyInstalled}</span>
                </div>
              ) : (
                <button
                  onClick={handleAddToHomeScreen}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.addToHomeScreen}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Voice Accessibility, Creator Credit & About/Legal */}
          <div className="lg:col-span-6 space-y-6">
            {/* Voice & Reading Assistant (Accessibility for Older Adults) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.voiceAccessibility}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.voiceAccessibilityDesc}
              </p>

              {/* Voice Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  {t.selectVoice}
                </label>
                <select
                  value={selectedVoiceId}
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <optgroup label={t.aiVoicesGroup}>
                    {AI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </optgroup>
                  {deviceVoices.length > 0 && (
                    <optgroup label={t.deviceVoicesGroup}>
                      {deviceVoices.map((dv) => (
                        <option key={dv.voiceURI} value={`browser:${dv.voiceURI}`}>
                          {dv.name} ({dv.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Reading Speed */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  {t.readingSpeed}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {speedOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSpeechRate(opt.value)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                        speechRate === opt.value
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Voice Button */}
              <button
                onClick={() => {
                  if (isSpeaking || isLoadingAudio) {
                    stop();
                  } else {
                    void speak(t.sampleTestSentence, language);
                  }
                }}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                  isSpeaking || isLoadingAudio
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                }`}
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.readingResult}</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>{t.stopReading}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.testVoice}</span>
                  </>
                )}
              </button>
            </div>

            {/* Creator & Developer Credit Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> {t.creatorTitle}
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-extrabold font-['Outfit'] text-base flex items-center justify-center shadow-md flex-shrink-0">
                  US
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {t.creatorByLabel}
                  </span>
                  <h4 className="text-sm font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
                    {t.creatorName}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{t.creatorRole}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span>{t.creatorDept}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Support & Legal */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.aboutLegal}</h3>

              <button
                onClick={() => setShowFeedbackModal(true)}
                className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" /> {t.sendFeedback}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              </button>

              {/* My Private Feedback & Admin Replies Inbox */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.myFeedbackTitle}
                  </span>
                  {myFeedback.filter((f) => f.status === 'replied').length > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {myFeedback.filter((f) => f.status === 'replied').length} {t.adminRepliedBadge}
                    </span>
                  )}
                </div>

                {myFeedback.length === 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.myFeedbackEmpty}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {myFeedback.map((fb) => (
                      <div
                        key={fb.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                          <span
                            className={`font-bold ${
                              fb.status === 'replied'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {fb.status === 'replied' ? t.adminRepliedBadge : t.adminPendingBadge}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{fb.message}</p>

                        {fb.adminReply ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 space-y-0.5">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">
                              {t.adminReplyFromLabel}
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{fb.adminReply}</p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">{t.waitingAdminReply}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t.privacyEncryption}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.privacyDesc}
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Info className="w-4 h-4 text-amber-500 dark:text-amber-400" /> {t.aboutNutriScan}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.aboutDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Home Screen Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-slate-900 dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-['Outfit'] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {t.installGuideTitle}
              </h3>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className={`p-3 rounded-2xl border ${isIOS ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40'}`}>
                {t.installGuideAndroid}
              </div>
              <div className={`p-3 rounded-2xl border ${isIOS ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                {t.installGuideIOS}
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {t.installGuideDesktop}
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
            >
              {t.gotIt}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-slate-900 dark:text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> {t.sendAppFeedback}
            </h3>
            {feedbackSent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 text-center font-bold">
                {t.feedbackThanks}
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-3">
                <textarea
                  required
                  rows={4}
                  placeholder={t.feedbackPlaceholder}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {feedbackError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{feedbackError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    {submittingFeedback ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {t.submit}
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
