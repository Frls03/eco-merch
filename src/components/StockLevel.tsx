interface StockLevelProps {
  current: number;
  initial: number;
}

function levelTone(ratio: number) {
  if (ratio <= 0) return { bar: 'bg-ink-700', text: 'text-paper/40', label: 'AGOTADO' };
  if (ratio <= 0.2) return { bar: 'bg-coral-500', text: 'text-coral-400', label: 'CASI AGOTADO' };
  if (ratio <= 0.5) return { bar: 'bg-amber-500', text: 'text-amber-400', label: 'STOCK BAJO' };
  return { bar: 'bg-mint-400', text: 'text-mint-400', label: 'DISPONIBLE' };
}

/** Barra segmentada tipo "perforación de boleto" — evita el look genérico de progress bar. */
export function StockLevel({ current, initial }: StockLevelProps) {
  const ratio = initial > 0 ? current / initial : 0;
  const tone = levelTone(ratio);
  const segments = 10;
  const filled = Math.round(ratio * segments);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className={`font-mono text-[11px] font-bold tracking-wider ${tone.text}`}>
          {tone.label}
        </span>
        <span className="font-mono text-[11px] text-paper/50">de {initial}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-[2px] transition-colors duration-200 ${
              i < filled ? tone.bar : 'bg-ink-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
