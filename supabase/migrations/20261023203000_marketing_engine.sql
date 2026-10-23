-- Motor de marketing: campanhas por canal, visitas medidas e extrato de comissoes dos afiliados
create table if not exists public.store_visits (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  channel text not null,
  campaign text,
  ref_code text,
  created_at timestamptz not null default now()
);
create index if not exists store_visits_store_idx on public.store_visits (store_id, created_at desc);

create table if not exists public.store_campaigns (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  channel text not null,
  headline text not null,
  body text,
  link text,
  status text not null default 'draft',
  launch_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists store_campaigns_store_idx on public.store_campaigns (store_id, created_at desc);

create table if not exists public.store_commissions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  affiliate_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'recurring',
  amount_usd numeric(10,2) not null default 0,
  period date not null default (now() at time zone 'utc')::date,
  status text not null default 'pending',
  note text,
  created_at timestamptz not null default now()
);
create index if not exists store_commissions_affiliate_idx on public.store_commissions (affiliate_id, period desc);

alter table public.store_visits enable row level security;
alter table public.store_campaigns enable row level security;
alter table public.store_commissions enable row level security;

grant insert on public.store_visits to anon, authenticated;
grant select on public.store_visits to authenticated;
grant select, insert, update, delete on public.store_campaigns to authenticated;
grant select on public.store_commissions to authenticated;
grant all on public.store_visits, public.store_campaigns, public.store_commissions to service_role;

drop policy if exists "anyone records a visit" on public.store_visits;
create policy "anyone records a visit" on public.store_visits for insert
  with check (exists (select 1 from public.stores s where s.id = store_visits.store_id and s.status = 'active'));

drop policy if exists "owner reads visits" on public.store_visits;
create policy "owner reads visits" on public.store_visits for select
  using (exists (
    select 1 from public.stores s
    where s.id = store_visits.store_id
      and (s.owner_id = (select auth.uid()) or has_role((select auth.uid()), 'admin'::app_role))
  ));

drop policy if exists "owner manages campaigns" on public.store_campaigns;
create policy "owner manages campaigns" on public.store_campaigns for all
  using (exists (
    select 1 from public.stores s
    where s.id = store_campaigns.store_id
      and (s.owner_id = (select auth.uid()) or has_role((select auth.uid()), 'admin'::app_role))
  ))
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.stores s where s.id = store_campaigns.store_id and s.owner_id = (select auth.uid()))
  );

drop policy if exists "affiliate reads own commissions" on public.store_commissions;
create policy "affiliate reads own commissions" on public.store_commissions for select
  using (
    affiliate_id = (select auth.uid())
    or exists (select 1 from public.stores s where s.id = store_commissions.store_id and s.owner_id = (select auth.uid()))
    or has_role((select auth.uid()), 'admin'::app_role)
  );

drop policy if exists "admin manages commissions" on public.store_commissions;
create policy "admin manages commissions" on public.store_commissions for all
  using (has_role((select auth.uid()), 'admin'::app_role))
  with check (has_role((select auth.uid()), 'admin'::app_role));
