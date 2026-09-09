-- JUTEL 2026 — rode no SQL Editor do Supabase

create table if not exists public.match_results (
  match_id text primary key,
  score_a integer not null,
  score_b integer not null,
  walkover boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.match_results
  add column if not exists penalty_a integer,
  add column if not exists penalty_b integer;

alter table public.match_results enable row level security;

drop policy if exists "Leitura pública dos placares" on public.match_results;
create policy "Leitura pública dos placares"
  on public.match_results for select
  using (true);

drop policy if exists "Escrita pública dos placares" on public.match_results;
create policy "Escrita pública dos placares"
  on public.match_results for all
  using (true)
  with check (true);

-- Depois: autenticação da mesa/organização e políticas mais restritas.
