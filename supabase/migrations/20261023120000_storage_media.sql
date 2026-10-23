-- Bucket publico de imagens dos anuncios: limite de 5 MB e apenas PNG, JPG ou WEBP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura livre: as imagens aparecem nos anuncios para qualquer visitante.
drop policy if exists "media_read_public" on storage.objects;
create policy "media_read_public" on storage.objects
  for select using (bucket_id = 'media');

-- Escrita apenas na propria pasta: media/<id do utilizador>/<ficheiro>.
drop policy if exists "media_insert_own" on storage.objects;
create policy "media_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media_update_own" on storage.objects;
create policy "media_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media_delete_own" on storage.objects;
create policy "media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
