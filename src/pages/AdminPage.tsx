import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  clearAdminSession,
  fetchAdminOverview,
  getSavedAdminToken,
  replyToUserFeedback,
  verifyAdminPasscode,
} from '../services/feedbackService';
import { FeedbackItem, RegisteredAccountSummary } from '../types';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  LogOut,
  Search,
  RefreshCw,
  Loader2,
  Lock,
  Scan,
} from 'lucide-react';

interface AdminPageProps {
  onExitAdmin: () => void;
  onWrongPasscode: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onExitAdmin, onWrongPasscode }) => {
  const { t } = useTheme();
  const [authorized, setAuthorized] = useState<boolean>(Boolean(getSavedAdminToken()));
  const [passcodeInput, setPasscodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [activeTab, setActiveTab] = useState<'feedback' | 'accounts'>('feedback');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<RegisteredAccountSummary[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalFeedback: 0,
    pendingFeedback: 0,
    totalScansStored: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOverview();
      setAccounts(data.accounts || []);
      setFeedback(data.feedback || []);
      setStats(data.stats);
      setAuthorized(true);
    } catch (err: any) {
      if (err?.message === 'ADMIN_UNAUTHORIZED') {
        setAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      void loadOverview();
    }
  }, [authorized]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim() || verifying) return;
    setVerifying(true);
    try {
      const res = await verifyAdminPasscode(passcodeInput.trim());
      if (res.verified) {
        setAuthorized(true);
      } else {
        onWrongPasscode();
      }
    } catch {
      onWrongPasscode();
    } finally {
      setVerifying(false);
    }
  };

  const handleSendReply = async (fbId: string) => {
    const replyText = (replyDrafts[fbId] || '').trim();
    if (!replyText || sendingReplyId) return;
    setSendingReplyId(fbId);
    try {
      const updated = await replyToUserFeedback(fbId, replyText);
      setFeedback((prev) => prev.map((f) => (f.id === fbId ? updated : f)));
      setStats((prev) => ({
        ...prev,
        pendingFeedback: Math.max(0, feedback.filter((f) => f.id !== fbId && f.status !== 'replied').length),
      }));
      setReplyDrafts((prev) => ({ ...prev, [fbId]: '' }));
      setStatusToast(t.adminReplySent);
      setTimeout(() => setStatusToast(null), 2500);
    } catch (err: any) {
      setStatusToast(err?.message || 'Failed to send reply');
      setTimeout(() => setStatusToast(null), 3000);
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleLogoutAdmin = () => {
    clearAdminSession();
    setAuthorized(false);
    onExitAdmin();
  };

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.displayName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.provider.toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-['Outfit']">{t.adminPasscodeTitle}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.adminPasscodeDesc}</p>
            </div>
          </div>
          <form onSubmit={handlePasscodeSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                inputMode="numeric"
                required
                placeholder={t.adminPasscodePlaceholder}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={!passcodeInput.trim() || verifying}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t.adminUnlockBtn}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28 md:pb-12 transition-colors">
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-6 md:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> NutriScan AI Admin
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
              {t.adminWelcomeBanner}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50/90">{t.adminWelcomeSubtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => void loadOverview()}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{t.loading.replace('...', '')}</span>
            </button>
            <button
              type="button"
              onClick={handleLogoutAdmin}
              className="px-3.5 py-2 rounded-xl bg-slate-950/35 hover:bg-slate-950/55 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.adminSignOut}</span>
            </button>
          </div>
        </div>
      </div>

      {statusToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl">
          {statusToast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t.adminTotalAccounts}</span>
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-black font-['Outfit'] tabular-nums text-slate-900 dark:text-white mt-1.5">
              {stats.totalAccounts}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t.adminTotalFeedback}</span>
              <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-2xl font-black font-['Outfit'] tabular-nums text-slate-900 dark:text-white mt-1.5">
              {stats.totalFeedback}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t.adminPendingReplies}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black font-['Outfit'] tabular-nums text-amber-600 dark:text-amber-400 mt-1.5">
              {stats.pendingFeedback}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t.totalScans}</span>
              <Scan className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-2xl font-black font-['Outfit'] tabular-nums text-emerald-600 dark:text-emerald-400 mt-1.5">
              {stats.totalScansStored}
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'feedback'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.adminFeedbackTab}</span>
            <span className="tabular-nums opacity-85">({feedback.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'accounts'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.adminAccountsTab}</span>
            <span className="tabular-nums opacity-85">({accounts.length})</span>
          </button>
        </div>

        {/* Tab 1: Feedback & Private Replies */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {loading && feedback.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">{t.loading}</div>
            ) : feedback.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.adminNoFeedbackYet}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.senderName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.senderEmail} · <span className="uppercase">{item.senderType}</span> ·{' '}
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 flex-shrink-0 ${
                          item.status === 'replied'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {item.status === 'replied' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> {t.adminRepliedBadge}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> {t.adminPendingBadge}
                          </>
                        )}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      {item.message}
                    </div>

                    {item.adminReply && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                          {t.adminReplyFromLabel}{' '}
                          {item.repliedAt && `· ${new Date(item.repliedAt).toLocaleString()}`}
                        </span>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          {item.adminReply}
                        </p>
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder={t.adminReplyPlaceholder}
                        value={replyDrafts[item.id] ?? ''}
                        onChange={(e) =>
                          setReplyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleSendReply(item.id);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={!(replyDrafts[item.id] || '').trim() || sendingReplyId === item.id}
                        onClick={() => void handleSendReply(item.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors"
                      >
                        {sendingReplyId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{t.adminSendReply}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Registered User Accounts List */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.adminSearchAccounts}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {filteredAccounts.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.adminNoAccountsYet}</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-bold">#</th>
                        <th className="px-4 py-3 font-bold">{t.fullName}</th>
                        <th className="px-4 py-3 font-bold">{t.emailAddress}</th>
                        <th className="px-4 py-3 font-bold">Provider</th>
                        <th className="px-4 py-3 font-bold text-right">{t.scansCount}</th>
                        <th className="px-4 py-3 font-bold text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredAccounts.map((acc, index) => (
                        <tr key={acc.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 tabular-nums text-slate-400">{index + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {acc.displayName}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{acc.email}</td>
                          <td className="px-4 py-3 uppercase text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {acc.provider}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900 dark:text-white">
                            {acc.totalScans || 0}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 tabular-nums">
                            {new Date(acc.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
