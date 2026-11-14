import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { FoodScan } from '../types';
import { LANGUAGE_META, SupportedLanguage, Translations, translateRiskLevel } from '../i18n/translations';

export interface AIVoiceOption {
  id: string;
  name: string;
  label: string;
}

export const AI_VOICES: AIVoiceOption[] = [
  { id: 'ai:Kore', name: 'Kore', label: 'Kore — Warm & Clear' },
  { id: 'ai:Zephyr', name: 'Zephyr', label: 'Zephyr — Gentle & Calm' },
  { id: 'ai:Puck', name: 'Puck', label: 'Puck — Friendly & Bright' },
  { id: 'ai:Charon', name: 'Charon', label: 'Charon — Deep & Steady' },
  { id: 'ai:Fenrir', name: 'Fenrir', label: 'Fenrir — Strong & Crisp' },
];

interface SpeechContextType {
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  deviceVoices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  isLoadingAudio: boolean;
  speak: (text: string, language: SupportedLanguage) => Promise<void>;
  stop: () => void;
  buildScanNarration: (scan: FoodScan, language: SupportedLanguage, t: Translations) => string;
}

const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

const VOICE_STORAGE_KEY = 'nutriscan_voice_id';
const RATE_STORAGE_KEY = 'nutriscan_voice_rate';

export const SpeechProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVoiceId, setSelectedVoiceIdState] = useState<string>(() => {
    return localStorage.getItem(VOICE_STORAGE_KEY) || 'ai:Kore';
  });
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    const raw = localStorage.getItem(RATE_STORAGE_KEY);
    const num = raw ? parseFloat(raw) : 1.0;
    return [0.8, 1.0, 1.15].includes(num) ? num : 1.0;
  });
  const [deviceVoices, setDeviceVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSessionRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices() || [];
      setDeviceVoices(list);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const setSelectedVoiceId = (id: string) => {
    setSelectedVoiceIdState(id);
    localStorage.setItem(VOICE_STORAGE_KEY, id);
  };

  const setSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    localStorage.setItem(RATE_STORAGE_KEY, String(rate));
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const stop = () => {
    speechSessionRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  };

  const speakWithBrowser = (text: string, language: SupportedLanguage, voiceURI?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    const sessionId = ++speechSessionRef.current;
    window.speechSynthesis.cancel();

    const langCode = LANGUAGE_META[language]?.code || 'en';
    const voices = window.speechSynthesis.getVoices();
    const chosenVoice =
      (voiceURI ? voices.find((v) => v.voiceURI === voiceURI) : undefined) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(langCode)) ||
      voices[0];

    // Split into sentences so Chrome does not truncate long utterances
    const sentences = text
      .split(/(?<=[.!?।؟])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    let idx = 0;

    const speakNext = () => {
      if (speechSessionRef.current !== sessionId) return;
      if (idx >= sentences.length) {
        setIsSpeaking(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(sentences[idx]);
      if (chosenVoice) {
        utter.voice = chosenVoice;
        utter.lang = chosenVoice.lang;
      } else {
        utter.lang = langCode;
      }
      utter.rate = speechRate;
      utter.onend = () => {
        idx += 1;
        speakNext();
      };
      utter.onerror = () => {
        if (speechSessionRef.current === sessionId) {
          setIsSpeaking(false);
        }
      };
      window.speechSynthesis.speak(utter);
    };

    speakNext();
  };

  const speak = async (text: string, language: SupportedLanguage) => {
    if (!text.trim()) return;
    stop();

    const sessionId = ++speechSessionRef.current;

    if (selectedVoiceId.startsWith('browser:')) {
      const uri = selectedVoiceId.slice('browser:'.length);
      speakWithBrowser(text, language, uri);
      return;
    }

    // AI Neural Voice via /api/tts
    const voiceName = selectedVoiceId.startsWith('ai:') ? selectedVoiceId.slice(3) : 'Kore';
    setIsLoadingAudio(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName, language }),
      });

      if (speechSessionRef.current !== sessionId) return;

      if (!res.ok) {
        throw new Error('TTS service unavailable');
      }

      const data = await res.json();
      if (!data.audioBase64) {
        throw new Error('No audio data returned');
      }

      const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
      audio.playbackRate = speechRate;
      audioRef.current = audio;

      audio.onended = () => {
        if (speechSessionRef.current === sessionId) {
          setIsSpeaking(false);
          audioRef.current = null;
        }
      };
      audio.onerror = () => {
        if (speechSessionRef.current === sessionId) {
          setIsSpeaking(false);
          audioRef.current = null;
        }
      };

      setIsLoadingAudio(false);
      setIsSpeaking(true);
      await audio.play();
    } catch {
      if (speechSessionRef.current !== sessionId) return;
      setIsLoadingAudio(false);
      // Seamless fallback to browser SpeechSynthesis
      speakWithBrowser(text, language);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const buildScanNarration = (scan: FoodScan, language: SupportedLanguage, t: Translations): string => {
    const riskText = translateRiskLevel(scan.riskLevel, t);
    const brandPart = scan.brand && scan.brand !== 'Unknown' ? scan.brand : '';
    const serving = scan.servingSize || '100g';
    const warningsText = scan.warnings && scan.warnings.length > 0 ? scan.warnings.join('. ') : '';
    const elderlySuitability = scan.suitability?.forElderly
      ? scan.suitability.elderlyNotes
      : scan.suitability?.elderlyNotes;
    const diabeticSuitability = scan.suitability?.diabeticNotes || '';

    switch (language) {
      case 'Spanish':
        return [
          `Resultado de análisis para ${scan.productName}${brandPart ? ` de ${brandPart}` : ''}.`,
          `Obtuvo una puntuación de salud de ${scan.healthScore} sobre 100, calificación ${scan.grade}, clasificado como ${riskText}.`,
          scan.summary,
          `Por cada ${serving}, contiene ${scan.calories} de calorías, ${scan.protein} de proteína, ${scan.sugar} de azúcar, ${scan.fat} de grasa y ${scan.salt} de sal.`,
          warningsText ? `Advertencias importantes: ${warningsText}.` : '',
          elderlySuitability ? `Para personas mayores: ${elderlySuitability}.` : '',
          diabeticSuitability ? `Para personas con diabetes: ${diabeticSuitability}.` : '',
          scan.dailyAdvice || '',
        ]
          .filter(Boolean)
          .join(' ');

      case 'French':
        return [
          `Voici l'analyse santé pour ${scan.productName}${brandPart ? ` de ${brandPart}` : ''}.`,
          `Ce produit obtient un score de ${scan.healthScore} sur 100, note ${scan.grade}, niveau ${riskText}.`,
          scan.summary,
          `Pour ${serving}, il contient ${scan.calories} de calories, ${scan.protein} de protéines, ${scan.sugar} de sucre, ${scan.fat} de lipides et ${scan.salt} de sel.`,
          warningsText ? `Avertissements : ${warningsText}.` : '',
          elderlySuitability ? `Pour les personnes âgées : ${elderlySuitability}.` : '',
          diabeticSuitability ? `Pour les personnes diabétiques : ${diabeticSuitability}.` : '',
          scan.dailyAdvice || '',
        ]
          .filter(Boolean)
          .join(' ');

      case 'German':
        return [
          `Hier ist das Gesundheitsergebnis für ${scan.productName}${brandPart ? ` von ${brandPart}` : ''}.`,
          `Das Produkt erreicht ${scan.healthScore} von 100 Punkten, Note ${scan.grade}, Bewertung: ${riskText}.`,
          scan.summary,
          `Pro ${serving} enthält es ${scan.calories} Kalorien, ${scan.protein} Eiweiß, ${scan.sugar} Zucker, ${scan.fat} Fett und ${scan.salt} Salz.`,
          warningsText ? `Wichtige Hinweise: ${warningsText}.` : '',
          elderlySuitability ? `Für Senioren: ${elderlySuitability}.` : '',
          diabeticSuitability ? `Für Diabetiker: ${diabeticSuitability}.` : '',
          scan.dailyAdvice || '',
        ]
          .filter(Boolean)
          .join(' ');

      case 'Hindi':
        return [
          `${scan.productName}${brandPart ? ` (${brandPart})` : ''} का स्वास्थ्य विश्लेषण यहाँ है।`,
          `इसका हेल्थ स्कोर 100 में से ${scan.healthScore} है, ग्रेड ${scan.grade}, और श्रेणी ${riskText} है।`,
          scan.summary,
          `प्रति ${serving} में ${scan.calories} कैलोरी, ${scan.protein} प्रोटीन, ${scan.sugar} चीनी, ${scan.fat} वसा और ${scan.salt} नमक है।`,
          warningsText ? `मुख्य चेतावनी: ${warningsText}।` : '',
          elderlySuitability ? `बुजुर्गों के लिए सलाह: ${elderlySuitability}।` : '',
          diabeticSuitability ? `मधुमेह रोगियों के लिए: ${diabeticSuitability}।` : '',
          scan.dailyAdvice || '',
        ]
          .filter(Boolean)
          .join(' ');

      case 'Arabic':
        return [
          `إليك التحليل الصحي لمنتج ${scan.productName}${brandPart ? ` من ${brandPart}` : ''}.`,
          `حصل المنتج على درجة صحة ${scan.healthScore} من 100، بتقييم ${scan.grade}، ومستوى ${riskText}.`,
          scan.summary,
          `لكل ${serving}، يحتوي على ${scan.calories} سعرات حرارية، و${scan.protein} بروتين، و${scan.sugar} سكر، و${scan.fat} دهون، و${scan.salt} ملح.`,
          warningsText ? `تحذيرات مهمة: ${warningsText}.` : '',
          elderlySuitability ? `لكبار السن: ${elderlySuitability}.` : '',
          diabeticSuitability ? `لمرضى السكري: ${diabeticSuitability}.` : '',
          scan.dailyAdvice || '',
        ]
          .filter(Boolean)
          .join(' ');

      default:
        return [
          `Here is the health result for ${scan.productName}${brandPart ? ` by ${brandPart}` : ''}.`,
          `It received a health score of ${scan.healthScore} out of 100, Grade ${scan.grade}, rated ${riskText}.`,
          scan.summary,
          `Per ${serving}, it contains ${scan.calories}, ${scan.protein} of protein, ${scan.sugar} of sugar, ${scan.fat} of fat, and ${scan.salt} of salt.`,
          warningsText ? `Important warnings: ${warningsText}.` : '',
          elderlySuitability ? `For older adults: ${elderlySuitability}.` : '',
          diabeticSuitability ? `For diabetics: ${diabeticSuitability}.` : '',
          scan.dailyAdvice || '',
        ]
          .filter(Boolean)
          .join(' ');
    }
  };

  return (
    <SpeechContext.Provider
      value={{
        selectedVoiceId,
        setSelectedVoiceId,
        speechRate,
        setSpeechRate,
        deviceVoices,
        isSpeaking,
        isLoadingAudio,
        speak,
        stop,
        buildScanNarration,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const ctx = useContext(SpeechContext);
  if (!ctx) {
    throw new Error('useSpeech must be used within SpeechProvider');
  }
  return ctx;
};
