export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-tag border-2 border-paper bg-amber-500 font-display text-lg font-bold text-ink-950">
        N
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-paper">
        nexlum <span className="text-amber-400">merch</span>
      </span>
    </div>
  );
}
