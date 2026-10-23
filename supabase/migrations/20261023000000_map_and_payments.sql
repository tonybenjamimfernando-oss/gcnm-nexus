-- Fase 5: coordenadas no mapa
alter table public.listings add column if not exists latitude double precision;
alter table public.listings add column if not exists longitude double precision;

-- Fase 3: encomendas do checkout Stripe
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid not null,
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  stripe_session_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders_select_participant" on public.orders;
create policy "orders_select_participant" on public.orders
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());
