import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Button } from './UI';
import {
  Bot,
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Stethoscope,
  FlaskConical,
  Pill,
  ShieldQuestion,
  ChevronRight,
  Sparkles,
  Clock,
  User,
  StopCircle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface Session {
  id: string;
  title: string;
  time: number;
  messages: Message[];
}

// ── Config ────────────────────────────────────────────────────
const API_URL = 'https://medsyncaidatabase.onrender.com/api/chat';

// ── Helpers ───────────────────────────────────────────────────
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function formatAIText(text: string): string {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br />')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// ── Suggestion Cards ──────────────────────────────────────────
const SUGGESTIONS = [
  {
    icon: Stethoscope,
    title: 'Symptom Check',
    desc: 'Describe symptoms and get preliminary guidance',
    prompt: 'What are the common symptoms of Type 2 Diabetes?',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Pill,
    title: 'Drug Interactions',
    desc: 'Check for potential medicine interactions',
    prompt: 'What are the interactions between Metformin and Ibuprofen?',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: FlaskConical,
    title: 'Lab Results',
    desc: 'Understand what lab values mean',
    prompt: 'What does a high HbA1c level indicate?',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    icon: ShieldQuestion,
    title: 'Clinical Query',
    desc: 'Ask any medical or clinical question',
    prompt: 'What is the first-line treatment for hypertension?',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
];

// ── Typing Dots ───────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${[-0.32, -0.16, 0][i]}s` }}
          className="w-2 h-2 rounded-full bg-slate-500 inline-block animate-bounce"
        />
      ))}
    </div>
  );
}

// ── Welcome Screen ────────────────────────────────────────────
function WelcomeScreen({ onSuggest }: { onSuggest: (p: string) => void }) {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const role = localStorage.getItem('role') || 'PATIENT';

  // Match same fallback chain used in DashboardLayout
  const fullName: string = user.username || user.name || user.fullName || user.fullname || '';
  const firstName = fullName.split(' ')[0] || 'there';

  const prefix = role === 'DOCTOR' ? 'Dr. ' : '';
  const fallback = role === 'DOCTOR' ? 'Doctor' : role === 'ADMIN' ? 'Admin' : 'Patient';
  const displayFirst = firstName !== 'there' ? firstName : fallback;

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full mb-6">
        <Sparkles size={14} className="text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">
          AI Medical Assistant
        </span>
      </div>

      <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
        Hello, {prefix}{displayFirst} 👋
      </h2>
      <p className="text-slate-400 text-sm mb-10 max-w-md leading-relaxed">
        Ask me anything — drug interactions, clinical guidelines, symptom analysis,
        or patient care questions. I'm here to assist.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {SUGGESTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              onClick={() => onSuggest(s.prompt)}
              className="group flex items-start gap-4 p-4 rounded-2xl text-left
                         bg-slate-800/60 border border-slate-700/50
                         hover:border-emerald-500/40 hover:bg-slate-800
                         transition-all duration-200 hover:-translate-y-0.5
                         hover:shadow-lg hover:shadow-emerald-900/20"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200 mb-0.5">{s.title}</p>
                <p className="text-xs text-slate-500 leading-snug">{s.desc}</p>
              </div>
              <ChevronRight
                size={16}
                className="ml-auto mt-1 text-slate-600 group-hover:text-emerald-400
                           group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export const AIChatPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try { return JSON.parse(sessionStorage.getItem('pratham_sessions') || '[]'); }
    catch { return []; }
  });
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const currentSession = sessions.find((s) => s.id === currentId) ?? null;
  const recentSessions = [...sessions].reverse().slice(0, 15);

  useEffect(() => {
    sessionStorage.setItem('pratham_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [currentSession?.messages, busy]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = window.setTimeout(() => setToast({ msg: '', visible: false }), 3200);
  }, []);

  // ── Stop handler ─────────────────────────────────────────────
  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setBusy(false);
    showToast('Response stopped.');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [showToast]);

  const handleSend = useCallback(async (overrideText?: string) => {
    if (busy) return;
    const text = (overrideText ?? inputVal).trim();
    if (!text) return;

    // Create a fresh AbortController for this request
    const controller = new AbortController();
    abortRef.current = controller;

    setBusy(true);
    setInputVal('');

    let activeId = currentId;

    if (!activeId) {
      activeId = uid();
      const title = text.length > 36 ? text.slice(0, 36) + '…' : text;
      setSessions((prev) => [...prev, { id: activeId!, title, time: Date.now(), messages: [] }]);
      setCurrentId(activeId);
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId ? { ...s, messages: [...s.messages, { role: 'user', text }] } : s
      )
    );

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || `HTTP ${res.status}`);
      }
      const data: any = await res.json();
      if (data.success && data.reply) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId ? { ...s, messages: [...s.messages, { role: 'ai', text: data.reply }] } : s
          )
        );
      } else throw new Error(data.error || 'Empty response');
    } catch (err: any) {
      // Ignore abort errors — user intentionally stopped
      if (err.name === 'AbortError') {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId
              ? { ...s, messages: [...s.messages, { role: 'ai', text: '⏹ Response stopped by user.' }] }
              : s
          )
        );
        setBusy(false);
        return;
      }
      const msg = err.message?.includes('fetch')
        ? '⚠️ Cannot reach server. Is Spring Boot running on port 8080?'
        : '⚠️ ' + err.message;
      showToast(msg);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeId
            ? { ...s, messages: [...s.messages, { role: 'ai', text: "Sorry, I couldn't process that. Please make sure the server is running." }] }
            : s
        )
      );
    }

    abortRef.current = null;
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [busy, inputVal, currentId, showToast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputVal.trim() && !busy) handleSend();
    }
  };

  const handleNewChat = () => {
    if (busy) return;
    setCurrentId(null);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentId === id) setCurrentId(null);
  };

  const canSend = inputVal.trim().length > 0 && !busy;

  return (
    <>
      <style>{`
        .ai-bubble-content p { margin-bottom: 10px; }
        .ai-bubble-content p:last-child { margin-bottom: 0; }
        .ai-bubble-content pre {
          background: #0f172a;
          border: 1px solid rgba(148,163,184,0.1);
          border-radius: 10px; padding: 14px;
          overflow-x: auto; margin: 10px 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12.5px; color: #94a3b8;
        }
        .ai-bubble-content code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 12.5px; background: rgba(99,102,241,0.12);
          border-radius: 4px; padding: 1px 6px; color: #f9a8d4;
        }
        .ai-bubble-content pre code { background: none; color: #94a3b8; padding: 0; }
        .ai-bubble-content strong { color: #e2e8f0; font-weight: 700; }

        @keyframes msgSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-anim { animation: msgSlideUp 0.25s ease both; }

        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .animate-bounce { animation: dot-bounce 1.4s infinite ease-in-out both; }

        @keyframes stop-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        .stop-pulse { animation: stop-pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div className="flex h-[calc(100vh-64px)] gap-6">

        {/* ── LEFT SIDEBAR ───────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">
          <Card className="p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600
                              flex items-center justify-center shadow-sm flex-shrink-0">
                <Bot size={20} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Pratham AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-500 font-medium">Server Active</span>
                </div>
              </div>
            </div>
            <Button
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r
                         from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600
                         text-white border-none shadow-sm text-sm"
              onClick={handleNewChat}
            >
              <Plus size={16} />
              New Conversation
            </Button>
          </Card>

          <Card className="flex-1 p-4 border border-slate-100 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recent Chats
              </p>
              <span className="text-xs text-slate-400 font-medium">
                {sessions.length} total
              </span>
            </div>

            {recentSessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <MessageSquare size={28} className="text-slate-200 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No conversations yet</p>
                <p className="text-xs text-slate-300 mt-1">Start a new chat above</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 -mx-1 px-1">
                {recentSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentId(s.id)}
                    className={`group flex items-start gap-2.5 p-3 rounded-xl cursor-pointer
                                transition-all duration-150
                                ${s.id === currentId
                                  ? 'bg-emerald-50 border border-emerald-100'
                                  : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <MessageSquare
                      size={14}
                      className={`mt-0.5 flex-shrink-0 ${s.id === currentId ? 'text-emerald-500' : 'text-slate-300'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate leading-snug
                                    ${s.id === currentId ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {s.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} className="text-slate-300" />
                        <span className="text-[10px] text-slate-400">{timeAgo(s.time)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg
                                 hover:bg-red-50 text-slate-300 hover:text-red-400
                                 transition-all duration-150 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── RIGHT: CHAT ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden
                        bg-slate-900 border border-slate-700/50 shadow-xl min-w-0">

          {/* Topbar */}
          <div className="flex items-center justify-between px-5 py-3.5
                          border-b border-slate-700/50 bg-slate-900 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600
                              flex items-center justify-center">
                <Sparkles size={14} color="white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">Assist-Chat</p>
                <p className="text-[11px] text-slate-500">
                  {currentSession
                    ? `${currentSession.messages.length} messages`
                    : 'Ready to help'}
                </p>
              </div>
            </div>
            <button
              onClick={handleNewChat}
              title="Clear chat"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                         text-slate-400 hover:text-red-400 hover:bg-red-900/20
                         border border-transparent hover:border-red-800/40
                         transition-all duration-150"
            >
              <Trash2 size={13} />
              Clear
            </button>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,116,139,0.3) transparent' }}
          >
            {(!currentSession || currentSession.messages.length === 0) && !busy ? (
              <WelcomeScreen onSuggest={(p) => handleSend(p)} />
            ) : (
              <>
                {currentSession?.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`msg-anim flex gap-3 ${m.role === 'user' ? 'justify-end' : 'items-start'}`}
                  >
                    {m.role === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600
                                      flex items-center justify-center flex-shrink-0 mt-0.5
                                      shadow-md shadow-emerald-900/30">
                        <Bot size={15} color="white" strokeWidth={2.5} />
                      </div>
                    )}

                    {m.role === 'user' ? (
                      <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm
                                      bg-gradient-to-br from-emerald-500 to-teal-600
                                      text-white text-sm leading-relaxed font-medium
                                      shadow-md shadow-emerald-900/30">
                        {m.text}
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div
                          className="ai-bubble-content text-sm leading-relaxed text-slate-300"
                          dangerouslySetInnerHTML={{ __html: formatAIText(m.text) }}
                        />
                      </div>
                    )}

                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center
                                      justify-content-center flex-shrink-0 mt-0.5
                                      flex items-center justify-center">
                        <User size={15} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}

                {busy && (
                  <div className="flex items-start gap-3 msg-anim">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600
                                    flex items-center justify-center flex-shrink-0
                                    shadow-md shadow-emerald-900/30">
                      <Bot size={15} color="white" strokeWidth={2.5} />
                    </div>
                    <div className="px-4 py-2 bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-700/50">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-5 pb-5 pt-3 flex-shrink-0 border-t border-slate-700/50 bg-slate-900">
            <div className={`flex items-end gap-3 p-2 pl-4 rounded-2xl border transition-all duration-200
                            bg-slate-800
                            ${canSend || inputVal.length > 0
                              ? 'border-emerald-500/50 shadow-lg shadow-emerald-900/20'
                              : busy
                              ? 'border-red-500/30'
                              : 'border-slate-700/50'}`}>
              <textarea
                ref={inputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={busy}
                rows={1}
                placeholder={busy ? 'AI is responding...' : 'Ask a medical question...'}
                className="flex-1 bg-transparent border-none outline-none resize-none
                           text-slate-200 placeholder-slate-600 text-sm leading-relaxed
                           py-2 max-h-44 overflow-y-auto"
                style={{ fontFamily: 'inherit' }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 176) + 'px';
                }}
              />

              {/* Stop button — shown only while busy */}
              {busy ? (
                <button
                  onClick={handleStop}
                  title="Stop response"
                  className="stop-pulse w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                             bg-red-500 hover:bg-red-600 text-white
                             transition-all duration-200 hover:scale-105"
                >
                  <StopCircle size={18} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!canSend}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                              transition-all duration-200 font-semibold
                              ${canSend
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-900/40 hover:scale-105 hover:shadow-lg'
                                : 'bg-slate-700 text-slate-600 cursor-not-allowed'}`}
                >
                  <Send size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <p className="text-center text-[11px] text-slate-600 mt-2.5 font-medium">
              {busy ? 'Click ⏹ to stop the response' : 'Enter to send · Shift+Enter for new line'}
            </p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl
                    bg-slate-900 border border-slate-700 text-slate-200 text-sm font-medium
                    shadow-2xl transition-all duration-300
                    ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        {toast.msg}
      </div>
    </>
  );
};