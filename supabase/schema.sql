-- Kangaroo Mommy Creator Product Guide — backend table.
-- Lives in the existing KM Supabase project (ref axwkuiyrdcmeefeddpex),
-- isolated from the storefront tables. One row per product; a row exists
-- only when แอล has overridden something. Missing/null field => the page
-- falls back to the static default in brief-defaults.js / gallery.js.

create table if not exists creator_brief (
  product_id   text primary key,
  keymsg       text,
  features     text,
  ingredients  text,
  suitable     text,
  content      text,
  scenes       text,
  refs         text,
  hashtags     text,
  do_list      text,
  dont_list    text,
  link         text,
  gallery      jsonb,          -- ordered record: [{t:'b',k:'hero'},{t:'a',url:'...'}]
  updated_at   timestamptz not null default now()
);

alter table creator_brief enable row level security;

-- No login (แอล's choice): this is non-sensitive marketing content that is
-- meant to be public-readable, and the admin URL is kept private. anon may
-- read AND write THIS table only. Isolated from the storefront tables' RLS.
drop policy if exists "cb anon read"   on creator_brief;
drop policy if exists "cb anon insert" on creator_brief;
drop policy if exists "cb anon update" on creator_brief;
drop policy if exists "cb anon delete" on creator_brief;
create policy "cb anon read"   on creator_brief for select to anon using (true);
create policy "cb anon insert" on creator_brief for insert to anon with check (true);
create policy "cb anon update" on creator_brief for update to anon using (true) with check (true);
create policy "cb anon delete" on creator_brief for delete to anon using (true);
