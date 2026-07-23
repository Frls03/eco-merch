import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useInventory, type ProductWithVariants } from '@/hooks/useInventory';
import type { ProductType, Variant } from '@/lib/database.types';

const TYPE_LABEL: Record<ProductType, string> = { hoodie: 'Hoodie', totbag: 'Tote Bag' };
const ATTRIBUTE_LABEL: Record<ProductType, string> = { hoodie: 'Talla', totbag: 'Color' };

function NewProductForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('hoodie');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from('products').insert({ name: name.trim(), type });
    if (error) setError(error.message);
    else {
      setName('');
      onCreated();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card-stub flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:p-6">
      <div className="flex-1 space-y-1.5">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">
          Nombre del producto
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Hoodie Edición Especial"
          className="w-full rounded-tag border-2 border-ink-950/20 bg-white px-4 py-2.5 font-body text-ink-950 focus:border-ink-950 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-ink-700">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ProductType)}
          className="w-full rounded-tag border-2 border-ink-950/20 bg-white px-4 py-2.5 font-body text-ink-950 focus:border-ink-950 focus:outline-none sm:w-40"
        >
          <option value="hoodie">Hoodie (talla)</option>
          <option value="totbag">Tote Bag (color)</option>
        </select>
      </div>
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? 'Creando…' : '+ Agregar producto'}
      </button>
      {error && <p className="font-body text-sm text-coral-600 sm:basis-full">{error}</p>}
    </form>
  );
}

function NewVariantForm({ product, onCreated }: { product: ProductWithVariants; onCreated: () => void }) {
  const [value, setValue] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from('variants').insert({
      product_id: product.id,
      attribute_type: product.type === 'hoodie' ? 'talla' : 'color',
      attribute_value: value.trim(),
      stock_initial: stock,
      stock_current: stock,
    });
    if (error) {
      setError(
        error.code === '23505'
          ? `Ya existe "${value.trim()}" para este producto.`
          : error.message,
      );
    } else {
      setValue('');
      setStock(0);
      onCreated();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 border-t-2 border-dashed border-ink-950/15 pt-4">
      <div className="space-y-1">
        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-700">
          {ATTRIBUTE_LABEL[product.type]}
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={product.type === 'hoodie' ? 'S, M, L…' : 'Negro, Beige…'}
          className="w-32 rounded-tag border-2 border-ink-950/20 bg-white px-3 py-2 font-body text-sm text-ink-950 focus:border-ink-950 focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-700">
          Stock inicial
        </label>
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-24 rounded-tag border-2 border-ink-950/20 bg-white px-3 py-2 font-body text-sm text-ink-950 focus:border-ink-950 focus:outline-none"
        />
      </div>
      <button type="submit" disabled={busy} className="btn-primary !px-4 !py-2 !text-xs">
        {busy ? '…' : '+ Variante'}
      </button>
      {error && <p className="basis-full font-body text-xs font-semibold text-coral-600">{error}</p>}
    </form>
  );
}

function VariantEditRow({ variant, onUpdated }: { variant: Variant; onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(variant.stock_current);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await supabase.from('variants').update({ stock_current: value }).eq('id', variant.id);
    setBusy(false);
    setEditing(false);
    onUpdated();
  }

  async function remove() {
    if (!confirm(`¿Eliminar la variante "${variant.attribute_value}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from('variants').delete().eq('id', variant.id);
    onUpdated();
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="w-16 shrink-0 font-mono font-bold text-ink-950">{variant.attribute_value}</span>
      <span className="flex-1 font-body text-ink-700">
        Inicial: <strong className="text-ink-950">{variant.stock_initial}</strong>
      </span>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-20 rounded-tag border-2 border-ink-950/30 bg-white px-2 py-1 font-body text-ink-950 focus:border-ink-950 focus:outline-none"
          />
          <button onClick={save} disabled={busy} className="btn-primary !px-3 !py-1 !text-[11px]">
            Guardar
          </button>
          <button onClick={() => setEditing(false)} className="font-body text-xs text-ink-700 underline">
            cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold text-ink-950">{variant.stock_current}</span>
          <button onClick={() => setEditing(true)} className="font-body text-xs font-bold text-ink-700 underline">
            corregir
          </button>
          <button onClick={remove} className="font-body text-xs font-bold text-coral-600 underline">
            borrar
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const { products, loading, error, reload } = useInventory();

  async function toggleActive(product: ProductWithVariants) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    reload();
  }

  return (
    <div className="space-y-6">
      <NewProductForm onCreated={reload} />

      {loading && <p className="font-body text-paper/60">Cargando…</p>}
      {error && <p className="font-body text-coral-400">{error}</p>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="card-stub p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-950">{product.name}</h3>
                <span className="badge-pill mt-1">{TYPE_LABEL[product.type]}</span>
              </div>
              <button
                onClick={() => toggleActive(product)}
                className="font-body text-xs font-bold text-ink-700 underline"
              >
                {product.is_active ? 'desactivar' : 'activar'}
              </button>
            </div>

            <div className="divide-y divide-ink-950/10">
              {product.variants.map((v) => (
                <VariantEditRow key={v.id} variant={v} onUpdated={reload} />
              ))}
            </div>

            <div className="mt-3">
              <NewVariantForm product={product} onCreated={reload} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
