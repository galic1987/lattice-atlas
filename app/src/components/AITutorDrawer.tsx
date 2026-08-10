import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveTopic } from '@/data';
import { matchGlossaryTerm } from '@/data/glossary';
import { sound } from '@/lib/sound';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  topicId?: string;
  paperId?: string;
  timestamp: string;
}

const INITIAL_PROMPTS = [
  'What is Topological Quantum Error Correction in 1 sentence?',
  'Why does a distance-5 surface code need 49 physical qubits?',
  'What is Minimum Weight Perfect Matching (MWPM) decoding?',
  'What is Google Willow’s Λ = 2.14 error suppression factor?',
];

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
    const qLower = query.toLowerCase();
    const topicMatch = resolveTopic(query);
    const termMatch = matchGlossaryTerm(query);

    let replyText = '';
    const matchedTopicId: string | undefined = topicMatch?.id;

    if (topicMatch) {
      replyText = `${topicMatch.name} (Tier ${topicMatch.tier}): ${topicMatch.short}\n\n${topicMatch.detail.slice(0, 220)}…`;
    } else if (termMatch) {
      replyText = `${termMatch.term}: ${termMatch.short}`;
    } else if (qLower.includes('willow') || qLower.includes('lambda')) {
      replyText = 'Google Willow (Nature 638, 2024) reported a suppression factor Λ = 2.14 > 1 below threshold (p ≈ 0.3%): the logical error rate falls as the code distance grows from d=3 to d=5 to d=7.';
    } else if (qLower.includes('mwpm') || qLower.includes('matching')) {
      replyText = 'Minimum-Weight Perfect Matching pairs detection events (checks that flipped to −1) on the syndrome graph with minimum total edge weight — classically via Edmonds’ Blossom algorithm (1965).';
    } else if (qLower.includes('qubit') || qLower.includes('49')) {
      replyText = 'A distance-d rotated surface code uses N = d² + (d²−1) = 2d²−1 physical qubits — d² data qubits plus d²−1 syndrome ancillas. For d=5 that is 25 + 24 = 49.';
    } else {
      replyText = 'I don’t have a reference entry matching that phrasing. This panel only looks up the atlas’s own topics and glossary terms — it doesn’t generate answers — so try one of the suggested questions below, or browse the Glossary and Knowledge Map from the top nav.';
    }

    return {
      id: Math.random().toString(),
      sender: 'tutor',
      text: replyText,
      topicId: matchedTopicId,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex h-full w-full flex-col border-l border-plaquette/30 bg-ink-900 shadow-2xl sm:w-[440px]"
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
