-- Guardados na conta
create table if not exists public.saved_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table public.saved_listings enable row level security;
grant select, insert, delete on public.saved_listings to authenticated;

drop policy if exists "saved_select_own" on public.saved_listings;
create policy "saved_select_own" on public.saved_listings for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "saved_insert_own" on public.saved_listings;
create policy "saved_insert_own" on public.saved_listings for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "saved_delete_own" on public.saved_listings;
create policy "saved_delete_own" on public.saved_listings for delete to authenticated
  using (user_id = auth.uid());

-- Aviso de novas mensagens: cada participante marca como lidas as mensagens que recebeu
alter table public.messages add column if not exists read_at timestamptz;
grant update (read_at) on public.messages to authenticated;

drop policy if exists "messages_mark_read" on public.messages;
create policy "messages_mark_read" on public.messages for update to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_a::text = auth.uid()::text or c.participant_b::text = auth.uid()::text)
  ))
  with check (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (c.participant_a::text = auth.uid()::text or c.participant_b::text = auth.uid()::text)
  ));

-- Destaques de anuncios
alter table public.listings add column if not exists featured_until timestamptz;
grant update (featured_until) on public.listings to authenticated;
create index if not exists listings_featured_idx on public.listings (featured_until desc nulls last);
