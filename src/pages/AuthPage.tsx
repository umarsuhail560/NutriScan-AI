import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Scan, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const authTranslations = {
  English: {
    title: 'Welcome to NutriScan AI',
    description:
      'Sync your nutritional history, custom health profiles & achievements',
    secureSignIn: 'Sign in securely using your Google Account',
    continueGoogle: 'Continue with Google',
    signingIn: 'Signing in...',
    secureFirebase: 'Secure authentication powered by Firebase',
    cancelled: 'Google sign-in was cancelled.',
    popupBlocked:
      'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    differentCredential:
      'An account already exists with this email using a different sign-in method.',
    failed: 'Google sign-in failed. Please try again.',
  },

  Spanish: {
    title: 'Bienvenido a NutriScan AI',
    description:
      'Sincroniza tu historial nutricional, perfiles de salud y logros',
    secureSignIn: 'Inicia sesión de forma segura con tu cuenta de Google',
    continueGoogle: 'Continuar con Google',
    signingIn: 'Iniciando sesión...',
    secureFirebase: 'Autenticación segura proporcionada por Firebase',
    cancelled: 'Se canceló el inicio de sesión con Google.',
    popupBlocked:
      'El navegador bloqueó la ventana de inicio de sesión. Permite las ventanas emergentes para este sitio.',
    differentCredential:
      'Ya existe una cuenta con este correo electrónico usando otro método de inicio de sesión.',
    failed: 'El inicio de sesión con Google falló. Inténtalo de nuevo.',
  },

  French: {
    title: 'Bienvenue sur NutriScan AI',
    description:
      'Synchronisez votre historique nutritionnel, vos profils de santé et vos réalisations',
    secureSignIn:
      'Connectez-vous en toute sécurité avec votre compte Google',
    continueGoogle: 'Continuer avec Google',
    signingIn: 'Connexion...',
    secureFirebase: 'Authentification sécurisée fournie par Firebase',
    cancelled: 'La connexion Google a été annulée.',
    popupBlocked:
      'La fenêtre de connexion a été bloquée par votre navigateur. Autorisez les fenêtres pop-up pour ce site.',
    differentCredential:
      'Un compte existe déjà avec cette adresse e-mail en utilisant une autre méthode de connexion.',
    failed: 'La connexion Google a échoué. Veuillez réessayer.',
  },

  German: {
    title: 'Willkommen bei NutriScan AI',
    description:
      'Synchronisiere deinen Ernährungsverlauf, Gesundheitsprofile und Erfolge',
    secureSignIn: 'Melde dich sicher mit deinem Google-Konto an',
    continueGoogle: 'Mit Google fortfahren',
    signingIn: 'Anmeldung...',
    secureFirebase: 'Sichere Authentifizierung durch Firebase',
    cancelled: 'Die Google-Anmeldung wurde abgebrochen.',
    popupBlocked:
      'Das Anmeldefenster wurde von deinem Browser blockiert. Erlaube Pop-ups für diese Website.',
    differentCredential:
      'Für diese E-Mail-Adresse existiert bereits ein Konto mit einer anderen Anmeldemethode.',
    failed: 'Die Google-Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.',
  },

  Hindi: {
    title: 'NutriScan AI में आपका स्वागत है',
    description:
      'अपने पोषण इतिहास, स्वास्थ्य प्रोफ़ाइल और उपलब्धियों को सिंक करें',
    secureSignIn: 'अपने Google खाते से सुरक्षित रूप से साइन इन करें',
    continueGoogle: 'Google के साथ जारी रखें',
    signingIn: 'साइन इन हो रहा है...',
    secureFirebase: 'Firebase द्वारा सुरक्षित प्रमाणीकरण',
    cancelled: 'Google साइन-इन रद्द कर दिया गया।',
    popupBlocked:
      'आपके ब्राउज़र ने साइन-इन पॉपअप को ब्लॉक कर दिया है। कृपया इस साइट के लिए पॉपअप की अनुमति दें।',
    differentCredential:
      'इस ईमेल से पहले से एक खाता मौजूद है जो किसी अन्य साइन-इन विधि का उपयोग करता है।',
    failed: 'Google साइन-इन विफल हुआ। कृपया फिर से प्रयास करें।',
  },

  Arabic: {
    title: 'مرحباً بك في NutriScan AI',
    description:
      'قم بمزامنة سجل التغذية وملفات الصحة والإنجازات الخاصة بك',
    secureSignIn: 'سجّل الدخول بأمان باستخدام حساب Google الخاص بك',
    continueGoogle: 'المتابعة باستخدام Google',
    signingIn: 'جارٍ تسجيل الدخول...',
    secureFirebase: 'مصادقة آمنة بواسطة Firebase',
    cancelled: 'تم إلغاء تسجيل الدخول باستخدام Google.',
    popupBlocked:
      'تم حظر نافذة تسجيل الدخول بواسطة المتصفح. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.',
    differentCredential:
      'يوجد حساب بالفعل بهذا البريد الإلكتروني باستخدام طريقة تسجيل دخول مختلفة.',
    failed: 'فشل تسجيل الدخول باستخدام Google. حاول مرة أخرى.',
  },
};

export const AuthPage: React.FC<AuthPageProps> = ({
  onClose,
  onSuccess,
}) => {
  const { signInWithGoogle } = useAuth();
  const { theme, language } = useTheme();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const text =
    authTranslations[language] || authTranslations.English;

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/popup-closed-by-user') {
      return text.cancelled;
    }

    if (code === 'auth/popup-blocked') {
      return text.popupBlocked;
    }

    if (code === 'auth/account-exists-with-different-credential') {
      return text.differentCredential;
    }

    return message || text.failed;
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);

    try {
      await signInWithGoogle();

      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 transition-colors">

      {/* Logo and Heading */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30">
          <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Scan className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold font-['Outfit'] text-slate-900 dark:text-white tracking-tight">
          {text.title}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {text.description}
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 rounded-xl text-xs text-rose-600 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <div className="space-y-4">

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {text.secureSignIn}
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {/* Google Logo */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />

                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />

                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />

                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>

              <span>
                {submitting
                  ? text.signingIn
                  : text.continueGoogle}
              </span>
            </button>

          </div>

          {/* Security Information */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">

            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {text.secureFirebase}
            </p>

          </div>

        </div>
      </div>

    </div>
  );
};