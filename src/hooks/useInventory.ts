import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Product, Variant } from '@/lib/database.types';

export interface ProductWithVariants extends Product {
  variants: Variant[];
}

/**
 * Carga productos + variantes y se mantiene sincronizado en tiempo real vía
 * Supabase Realtime (tabla `variants`), para que el stand y bodega reflejen
 * los cambios de stock sin refrescar la página.
 */
export function useInventory() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [{ data: productsData, error: pErr }, { data: variantsData, error: vErr }] =
      await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('created_at'),
        supabase.from('variants').select('*'),
      ]);

    if (pErr || vErr) {
      setError(pErr?.message ?? vErr?.message ?? 'Error cargando inventario');
      setLoading(false);
      return;
    }

    const merged: ProductWithVariants[] = (productsData ?? []).map((p) => ({
      ...p,
      variants: (variantsData ?? [])
        .filter((v) => v.product_id === p.id)
        .sort((a, b) => a.attribute_value.localeCompare(b.attribute_value)),
    }));

    setProducts(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('variants-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'variants' },
        (payload) => {
          setProducts((prev) =>
            prev.map((product) => {
              if (product.id !== (payload.new as Variant | undefined)?.product_id
                && product.id !== (payload.old as Variant | undefined)?.product_id) {
                return product;
              }
              if (payload.eventType === 'DELETE') {
                return {
                  ...product,
                  variants: product.variants.filter((v) => v.id !== (payload.old as Variant).id),
                };
              }
              const updated = payload.new as Variant;
              const exists = product.variants.some((v) => v.id === updated.id);
              return {
                ...product,
                variants: exists
                  ? product.variants.map((v) => (v.id === updated.id ? updated : v))
                  : [...product.variants, updated].sort((a, b) =>
                      a.attribute_value.localeCompare(b.attribute_value),
                    ),
              };
            }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { products, loading, error, reload: load };
}

/** Descuenta (o ajusta) el stock de una variante vía la función RPC segura. */
export async function adjustStock(variantId: string, delta: number, reason?: string) {
  const { data, error } = await supabase.rpc('adjust_stock', {
    p_variant_id: variantId,
    p_delta: delta,
    p_reason: reason ?? (delta < 0 ? 'Entrega en bodega' : 'Ajuste manual'),
  });
  return { data, error };
}
