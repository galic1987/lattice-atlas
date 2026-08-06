/** 5-segment difficulty meter (design.md §7.5): cyan (easy) → amber → rose (frontier). */
const SEGMENT_COLORS = ['#22D3EE', '#2DD4BF', '#F5B83D', '#F59E0B', '#FB7185'];

export default function DifficultyMeter({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2" title={`Difficulty ${level} of 5`}>
      <div className="flex items-end gap-[3px]" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="w-1 rounded-sm"
            style={{
              height: `${8 + i * 2}px`,
              backgroundColor: i < level ? SEGMENT_COLORS[i] : 'var(--ink-600)',
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] uppercase tracking-wider text-text-low">
        Difficulty {level}/5
      </span>
    </div>
  );
}
