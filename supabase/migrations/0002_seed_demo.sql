-- ============================================================================
-- Datos de ejemplo (opcional). Ejecutar solo si quieres ver la app con datos.
-- Puedes editar cantidades y nombres antes de correrlo, o borrarlo si vas a
-- cargar el stock real directamente desde el panel de administrador.
-- ============================================================================

with hoodie as (
  insert into public.products (name, type) values ('Hoodie Evento', 'hoodie')
  returning id
),
totbag as (
  insert into public.products (name, type) values ('Tote Bag Evento', 'totbag')
  returning id
)
insert into public.variants (product_id, attribute_type, attribute_value, stock_initial, stock_current)
select id, 'talla', v.talla, v.cant, v.cant
from hoodie, (values ('S', 15), ('M', 25), ('L', 20), ('XL', 10)) as v(talla, cant)
union all
select id, 'color', v.color, v.cant, v.cant
from totbag, (values ('Negro', 30), ('Beige', 20), ('Verde', 15)) as v(color, cant);
