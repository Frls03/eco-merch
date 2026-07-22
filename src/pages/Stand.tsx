import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { StockLevel } from '@/components/StockLevel';
import { useInventory, type ProductWithVariants } from '@/hooks/useInventory';
import { swatchFor } from '@/lib/colorMap';
import type { Variant } from '@/lib/database.types';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm text-paper/50">
      {now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

function VariantTile({ variant, showSwatch }: { variant: Variant; showSwatch: boolean }) {
  const outOfStock = variant.stock_current <= 0;
  return (
    <div
      className={`rounded-tag border-2 p-4 transition-opacity ${
        outOfStock ? 'border-ink-800 bg-ink-900/60 opacity-50' : 'border-ink-800 bg-ink-900'
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        {showSwatch && (
          <span
            className="h-4 w-4 rounded-full border-2 border-paper/30"
            style={{ backgroundColor: swatchFor(variant.attribute_value) }}
          />
        )}
        <span className="font-body text-sm font-bold uppercase tracking-wide text-paper">
          {variant.attribute_value}
        </span>
      </div>
      <p className="mb-3 font-display text-4xl font-bold tabular-nums text-paper">
        {outOfStock ? '—' : variant.stock_current}
      </p>
      <StockLevel current={variant.stock_current} initial={variant.stock_initial} />
    </div>
  );
}

function ProductPanel({ product }: { product: ProductWithVariants }) {
  return (
    <section className="card-stub p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-ink-950 sm:text-3xl">
          {product.name}
        </h2>
        <span className="badge-pill">{product.type === 'hoodie' ? 'Tallas' : 'Colores'}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {product.variants.map((v) => (
          <div key={v.id} className="rounded-tag bg-ink-950 p-0.5">
            <VariantTile variant={v} showSwatch={product.type === 'totbag'} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Stand() {
  const { products, loading, error } = useInventory();

  return (
    <div className="min-h-screen bg-ink-950 px-4 py-6 sm:px-8 sm:py-10">
      <header className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-chip border-2 border-mint-400 bg-mint-400/10 px-3 py-1.5">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-mint-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-mint-400">
              En vivo
            </span>
          </span>
          <LiveClock />
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6">
        {loading && <p className="font-body text-paper/60">Cargando disponibilidad…</p>}
        {error && <p className="font-body text-coral-400">{error}</p>}
        {!loading && products.length === 0 && (
          <p className="font-body text-paper/60">Aún no hay productos publicados.</p>
        )}
        {products.map((product) => (
          <ProductPanel key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
