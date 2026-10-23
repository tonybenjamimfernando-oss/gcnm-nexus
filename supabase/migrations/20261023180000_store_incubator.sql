-- Incubadora de lojas: cada afiliado hospeda a sua conta e monta a sua loja com servicos completos
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  category text,
  accent text not null default 'glow',
  logo_url text,
  cover_url text,
  country text,
  city text,
  currency text default 'USD',
  contact_email text,
  contact_phone text,
  website text,
  status text not null default 'active',
  tier text not null default 'starter',
  is_external boolean not null default true,
  affiliate_enabled boolean not null default true,
  default_commission numeric(5,2) not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_services (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  service text not null,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, service)
);

create table if not exists public.store_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  member_role text not null default 'agent',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create table if not exists public.store_affiliates (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null unique,
  commission numeric(5,2) not null default 10,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

alter table public.listings add column if not exists store_id uuid references public.stores (id) on delete set null;
create index if not exists listings_store_idx on public.listings (store_id);
create index if not exists stores_status_idx on public.stores (status, created_at desc);
create index if not exists stores_owner_idx on public.stores (owner_id);

alter table public.stores enable row level security;
alter table public.store_services enable row level security;
alter table public.store_members enable row level security;
alter table public.store_affiliates enable row level security;

grant select on public.stores to anon, authenticated;
grant insert, update, delete on public.stores to authenticated;
grant select on public.store_services to anon, authenticated;
grant insert, update, delete on public.store_services to authenticated;
grant select, insert, update, delete on public.store_members to authenticated;
grant select, insert, update, delete on public.store_affiliates to authenticated;
grant all on public.stores, public.store_services, public.store_members, public.store_affiliates to service_role;

drop policy if exists "public stores readable" on public.stores;
create policy "public stores readable" on public.stores for select
  using (status = 'active' or owner_id = (select auth.uid()) or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "owner creates store" on public.stores;
create policy "owner creates store" on public.stores for insert
  with check (owner_id = (select auth.uid()));

drop policy if exists "owner updates store" on public.stores;
create policy "owner updates store" on public.stores for update
  using (owner_id = (select auth.uid()) or has_role((select auth.uid()), 'admin'::app_role))
  with check (owner_id = (select auth.uid()) or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "owner deletes store" on public.stores;
create policy "owner deletes store" on public.stores for delete
  using (owner_id = (select auth.uid()) or has_role((select auth.uid()), 'admin'::app_role));

drop policy if exists "store services readable" on public.store_services;
create policy "store services readable" on public.store_services for select
  using (exists (
    select 1 from public.stores s
    where s.id = store_services.store_id
      and (s.status = 'active' or s.owner_id = (select auth.uid()) or has_role((select auth.uid()), 'admin'::app_role))
  ));

drop policy if exists "owner manages store services" on public.store_services;
create policy "owner manages store services" on public.store_services for all
  using (exists (select 1 from public.stores s where s.id = store_services.store_id and s.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.stores s where s.id = store_services.store_id and s.owner_id = (select auth.uid())));

drop policy if exists "store members readable" on public.store_members;
create policy "store members readable" on public.store_members for select
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.stores s where s.id = store_members.store_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "owner manages store members" on public.store_members;
create policy "owner manages store members" on public.store_members for all
  using (exists (select 1 from public.stores s where s.id = store_members.store_id and s.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.stores s where s.id = store_members.store_id and s.owner_id = (select auth.uid())));

drop policy if exists "store affiliates readable" on public.store_affiliates;
create policy "store affiliates readable" on public.store_affiliates for select
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.stores s where s.id = store_affiliates.store_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "affiliate joins open store" on public.store_affiliates;
create policy "affiliate joins open store" on public.store_affiliates for insert
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.stores s where s.id = store_affiliates.store_id and s.affiliate_enabled)
  );

drop policy if exists "owner manages store affiliates" on public.store_affiliates;
create policy "owner manages store affiliates" on public.store_affiliates for update
  using (exists (select 1 from public.stores s where s.id = store_affiliates.store_id and s.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.stores s where s.id = store_affiliates.store_id and s.owner_id = (select auth.uid())));

drop policy if exists "affiliate or owner leaves" on public.store_affiliates;
create policy "affiliate or owner leaves" on public.store_affiliates for delete
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.stores s where s.id = store_affiliates.store_id and s.owner_id = (select auth.uid()))
  );
