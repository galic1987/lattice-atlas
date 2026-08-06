import { useState } from 'react';
import { Download } from 'lucide-react';
import { topics, shortName, tierNames } from '@/data';

/**
 * Per-topic personal notes, autosaved locally, exportable as one
 * markdown file. Writing is encoding — the point is the writing.
 */

const NOTES_KEY = 'lattice-atlas-notes';

function loadNotes(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(NOTES_KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

function saveNote(topicId: string, text: string) {
  try {
    const all = loadNotes();
    if (text.trim() === '') delete all[topicId];
    else all[topicId] = text;
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

function exportAllNotes() {
  const all = loadNotes();
  const noted = topics.filter((t) => all[t.id]?.trim());
  const body =
    noted.length === 0
      ? 'No notes yet.\n'
      : noted
          .map(
            (t) =>
              `## ${shortName(t)} (Tier ${t.tier} · ${tierNames[t.tier]})\n\n${all[t.id].trim()}\n`,
          )
          .join('\n');
  const md = `# Lattice Atlas — study notes\n\nExported ${new Date().toISOString().slice(0, 10)}\n\n${body}`;
  const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lattice-atlas-notes.md';
  a.click();
  URL.revokeObjectURL(url);
}

export default function TopicNotes({ topicId }: { topicId: string }) {
  const [text, setText] = useState(() => loadNotes()[topicId] ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  const onChange = (value: string) => {
    setText(value);
    saveNote(topicId, value);
    setSavedFlash(true);
  };

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="eyebrow !mb-0">{'// MY NOTES'}</p>
        <button
          type="button"
          onClick={exportAllNotes}
          className="inline-flex items-center gap-1 font-mono text-[11px] text-text-low transition-colors hover:text-plaquette"
        >
          <Download className="h-3 w-3" /> export all
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setSavedFlash(false)}
        rows={4}
        placeholder="Write it in your own words — the summary you wish the drawer had opened with…"
        className="w-full resize-y rounded-lg border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm leading-relaxed text-text-hi placeholder:text-text-low focus:border-plaquette/60 focus:outline-none"
      />
      <p className="mt-1 font-mono text-[10px] text-text-low">
        {savedFlash ? 'saved locally ✓' : 'autosaves to this browser'}
      </p>
    </div>
  );
}
