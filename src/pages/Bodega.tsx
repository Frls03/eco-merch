import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { StockLevel } from '@/components/StockLevel';
import { adjustStock, useInventory, type ProductWithVariants } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';
import type { Variant } from '@/lib/database.types';

const BASE_NAV_ITEMS = [
  { to: '/bodega', label: 'Bodega' },
  { to: '/stand', label: 'Stand' },
];

function VariantRow({ variant, onDeliver }: { variant: Variant; onDeliver: (v: Variant) => void }) {
  const [busy, setBusy] = useState(false);
  const outOfStock = variant.stock_current <= 0;

  async function handleClick() {
    if (busy || outOfStock) return;
    setBusy(true);
    await onDeliver(variant);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3 border-b-2 border-ink-800 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-12 min-w-12 shrink-0 items-center justify-center whitespace-nowrap rounded-tag border-2 border-ink-700 bg-ink-900 px-2 font-mono text-sm font-bold text-paper">
          {variant.attribute_value}
        </span>
        <div className="min-w-0 flex-1 sm:w-48">
          <StockLevel current={variant.stock_current} initial={variant.stock_initial} />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <span className="font-display text-3xl font-semibold text-paper tabular-nums">
          {variant.stock_current}
        </span>
        <button
          onClick={handleClick}
          disabled={busy || outOfStock}
          className="btn-danger min-w-[9.5rem]"
          title="Registrar una entrega (resta 1 unidad)"
        >
          {outOfStock ? 'Sin stock' : busy ? 'Guardando…' : '− 1 Entregado'}
        </button>
      </div>
    </div>
  );
}

function ProductGroup({ product, onDeliver }: { product: ProductWithVariants; onDeliver: (v: Variant) => void }) {
  return (
    <div className="card-stub p-5 sm:p-6">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 break-words font-display text-xl font-semibold text-ink-950">
          {product.name}
        </h2>
        <span className="badge-pill shrink-0">{product.type === 'hoodie' ? 'Talla' : 'Color'}</span>
      </div>
      <div>
        {product.variants.map((v) => (
          <VariantRow key={v.id} variant={v} onDeliver={onDeliver} />
        ))}
        {product.variants.length === 0 && (
          <p className="py-4 font-body text-sm text-ink-700">
            Aún no hay variantes cargadas para este producto.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Bodega() {
  const { products, loading, error } = useInventory();
  const { profile } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const navItems =
    profile?.role === 'admin' ? [{ to: '/admin', label: 'Panel' }, ...BASE_NAV_ITEMS] : BASE_NAV_ITEMS;

  async function handleDeliver(variant: Variant) {
    const { error } = await adjustStock(variant.id, -1, `Entrega registrada por ${profile?.full_name ?? 'vendedor'}`);
    if (error) {
      setFeedback(`No se pudo registrar: ${error.message}`);
    } else {
      setFeedback(null);
    }
  }

  return (
    <AppShell navItems={navItems}>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-paper sm:text-3xl">
          Entregas en bodega
        </h1>
        <p className="mt-1 font-body text-sm text-paper/60">
          Toca “− 1 Entregado” cada vez que entregues una unidad. El stand lo verá reflejado al instante.
        </p>
      </div>

      {feedback && (
        <div className="mb-4 rounded-tag border-2 border-coral-500 bg-coral-500/10 px-4 py-3 font-body text-sm font-semibold text-coral-400">
          {feedback}
        </div>
      )}

      {loading && <p className="font-body text-paper/60">Cargando inventario…</p>}
      {error && <p className="font-body text-coral-400">{error}</p>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {products.map((product) => (
          <ProductGroup key={product.id} product={product} onDeliver={handleDeliver} />
        ))}
      </div>
    </AppShell>
  );
}
