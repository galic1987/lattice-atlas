import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveConceptLookup, CONCEPT_LOOKUP_PROMPTS } from '@/lib/conceptLookup';
import { sound } from '@/lib/sound';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  topicId?: string;
  paperId?: string;
  timestamp: string;
}

const INITIAL_PROMPTS = CONCEPT_LOOKUP_PROMPTS;

export default function AITutorDrawer({
  isOpen,
  onClose,
  initialQuery = '',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: 'This is a deterministic concept lookup over the atlas’s own topic and glossary data — not a language model. Ask about a TQEC topic or term and it will pull that entry’s definition and link you into the map. If a phrase isn’t in the atlas, it will say so rather than guess.',
      timestamp: 'Reference',
    },
  ]);
  const [inputText, setInputText] = useState(initialQuery);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Deterministic lookup: resolve the query against the atlas's own topic and
  // glossary data first, then a small set of curated, fact-checked reference
  // entries. If nothing matches, say so — never fabricate an answer.
  const generateAnswer = (query: string): ChatMessage => {
    const { text, topicId } = resolveConceptLookup(query);
    return {
      id: Math.random().toString(),
      sender: 'tutor',
      text,
      topicId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleSend = useCallback((textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    sound.playErrorFlip();

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Instant lookup — the short delay only lets the question render first;
    // it is not simulated "thinking".
    setTimeout(() => {
      const tutorReply = generateAnswer(text);
      sound.playDecoderLock();
      setMessages((prev) => [...prev, tutorReply]);
    }, 120);
  }, [inputText]);

  useEffect(() => {
    if (initialQuery.trim().length > 0) {
      const timer = setTimeout(() => {
        handleSend(initialQuery);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialQuery, handleSend]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Modal a11y: Escape to close, move focus into the drawer on open, restore on close.
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!isOpen) return undefined;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => drawerRef.current?.focus(), 40);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink-950/70 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="TQEC concept lookup"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex h-full w-full flex-col border-l border-plaquette/30 bg-ink-900 shadow-2xl outline-none sm:w-[440px]"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-ink-700 p-4 bg-ink-850">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg border border-plaquette/40 bg-plaquette/15 p-2 text-plaquette">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">// CONCEPT LOOKUP · NOT A LANGUAGE MODEL</span>
                  <h3 className="font-display text-base font-bold text-text-hi">TQEC Concept Reference</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-mid hover:bg-ink-700 hover:text-text-hi"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [scrollbar-width:thin]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-plaquette/20 text-text-hi border border-plaquette/40 rounded-br-none'
                        : 'bg-ink-850 text-text-mid border border-ink-700 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {m.topicId && (
                      <Link
                        to={`/map?topic=${m.topicId}`}
                        onClick={onClose}
                        className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-plaquette hover:underline"
                      >
                        Explore topic on Knowledge Map <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <span className="mt-1 font-mono text-[9px] text-text-low">{m.timestamp}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Prompts */}
            <div className="border-t border-ink-800 p-3 bg-ink-950">
              <span className="font-mono text-[10px] text-text-low block mb-2">SUGGESTED QUESTIONS:</span>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[10px] text-text-mid hover:border-plaquette/50 hover:text-plaquette"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="border-t border-ink-700 p-3 bg-ink-850">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Look up a TQEC topic or term..."
                  className="flex-1 rounded-xl border border-ink-600 bg-ink-950 px-3.5 py-2.5 font-mono text-xs text-text-hi placeholder:text-text-low focus:border-plaquette focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="btn-primary !p-2.5 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
