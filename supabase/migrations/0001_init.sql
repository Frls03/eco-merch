-- ============================================================================
-- Nexlum Merch — esquema inicial
-- Ejecutar completo en el SQL Editor de Supabase (o via `supabase db push`)
-- ============================================================================

-- Extensiones necesarias
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Roles de usuario
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'vendedor');
  end if;
end$$;

-- Perfil extendido de cada usuario de auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  role        user_role not null default 'vendedor',
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil y rol de cada usuario (admin o vendedor).';

-- ----------------------------------------------------------------------------
-- 2. Productos (Hoodie, Tot Bag, ...)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_type') then
    create type product_type as enum ('hoodie', 'totbag');
  end if;
  if not exists (select 1 from pg_type where typname = 'variant_attribute') then
    create type variant_attribute as enum ('talla', 'color');
  end if;
end$$;

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        product_type not null,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Variantes (talla para hoodies, color para tot bags)
-- ----------------------------------------------------------------------------
create table if not exists public.variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products (id) on delete cascade,
  attribute_type  variant_attribute not null,
  attribute_value text not null,           -- ej. 'S', 'M', 'L' o 'Negro', 'Beige'
  stock_initial   integer not null default 0 check (stock_initial >= 0),
  stock_current   integer not null default 0 check (stock_current >= 0),
  updated_at      timestamptz not null default now(),
  updated_by      uuid references public.profiles (id),
  unique (product_id, attribute_value)
);

create index if not exists variants_product_id_idx on public.variants (product_id);

-- ----------------------------------------------------------------------------
-- 4. Bitácora de movimientos de stock (auditoría)
-- ----------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references public.variants (id) on delete cascade,
  change      integer not null,         -- negativo = entrega, positivo = ajuste/corrección
  reason      text,
  created_by  uuid references public.profiles (id),
  created_at  timestamptz not null default now()
);

create index if not exists stock_movements_variant_id_idx on public.stock_movements (variant_id);

-- ----------------------------------------------------------------------------
-- 5. Trigger: crear perfil automáticamente al registrar usuario
--    (el rol se asigna luego manualmente por un admin, default 'vendedor')
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), 'vendedor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 6. Función segura para descontar / ajustar stock (RPC)
--    Evita condiciones de carrera y stock negativo (server-side, security definer)
-- ----------------------------------------------------------------------------
create or replace function public.adjust_stock(p_variant_id uuid, p_delta integer, p_reason text default null)
returns public.variants
language plpgsql
security definer set search_path = public
as $$
declare
  v_role user_role;
  v_result public.variants;
begin
  select role into v_role from public.profiles where id = auth.uid();

  if v_role is null then
    raise exception 'No autorizado: usuario sin perfil';
  end if;

  update public.variants
     set stock_current = stock_current + p_delta,
         updated_at = now(),
         updated_by = auth.uid()
   where id = p_variant_id
     and stock_current + p_delta >= 0
  returning * into v_result;

  if v_result.id is null then
    raise exception 'Stock insuficiente o variante inexistente';
  end if;

  insert into public.stock_movements (variant_id, change, reason, created_by)
  values (p_variant_id, p_delta, p_reason, auth.uid());

  return v_result;
end;
$$;

grant execute on function public.adjust_stock(uuid, integer, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 7. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.products        enable row level security;
alter table public.variants        enable row level security;
alter table public.stock_movements enable row level security;

-- Helper: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles: cada quien ve su perfil; admin ve todos
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_admin_only"
  on public.profiles for update
  using (public.is_admin());

-- products: lectura pública (para pantalla del stand sin login);
--           escritura solo admin
create policy "products_select_public"
  on public.products for select
  using (true);

create policy "products_write_admin"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- variants: lectura pública (stand en tiempo real);
--           escritura directa reservada a admin (setup de stock inicial).
--           Los descuentos de vendedores pasan por adjust_stock(), no por UPDATE directo.
create policy "variants_select_public"
  on public.variants for select
  using (true);

create policy "variants_write_admin"
  on public.variants for all
  using (public.is_admin())
  with check (public.is_admin());

-- stock_movements: solo lectura para admin (auditoría); inserciones via RPC (security definer)
create policy "stock_movements_select_admin"
  on public.stock_movements for select
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Realtime: publicar cambios de stock para la pantalla del stand
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.variants;

-- ============================================================================
-- Fin de la migración inicial
-- ============================================================================
