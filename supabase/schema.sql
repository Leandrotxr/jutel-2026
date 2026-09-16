-- JUTEL 2026 — rode no SQL Editor do Supabase
-- Auth: Authentication → Providers → Email → desative "Confirm email"
-- para o cadastro entrar na hora (útil no evento).

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

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  phone text not null,
  cpf text not null,
  role text not null default 'publico' check (role in ('publico', 'assessor', 'diretor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_digits check (phone ~ '^\d{10,11}$'),
  constraint profiles_cpf_digits check (cpf ~ '^\d{11}$'),
  constraint profiles_cpf_unique unique (cpf)
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to anon, authenticated;

create or replace function public.cpf_available(digits text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where cpf = regexp_replace(coalesce(digits, ''), '\D', '', 'g')
  )
$$;

revoke all on function public.cpf_available(text) from public;
grant execute on function public.cpf_available(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text := 'publico';
  phone_digits text;
  cpf_digits text;
begin
  phone_digits := regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '\D', '', 'g');
  cpf_digits := regexp_replace(coalesce(new.raw_user_meta_data->>'cpf', ''), '\D', '', 'g');

  if lower(coalesce(new.email, '')) = 'leandro7teixeita@gmail.com' then
    new_role := 'diretor';
  end if;

  insert into public.profiles (id, email, phone, cpf, role)
  values (new.id, new.email, phone_digits, cpf_digits, new_role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.protect_diretor_role()
returns trigger
language plpgsql
as $$
begin
  if old.role = 'diretor' and new.role is distinct from 'diretor' then
    if (select count(*) from public.profiles where role = 'diretor' and id <> old.id) = 0 then
      raise exception 'É preciso manter pelo menos um diretor.';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_protect_diretor on public.profiles;
create trigger profiles_protect_diretor
  before update on public.profiles
  for each row execute procedure public.protect_diretor_role();

alter table public.profiles enable row level security;

drop policy if exists "Ler próprio perfil ou lista de diretores" on public.profiles;
create policy "Ler próprio perfil ou lista de diretores"
  on public.profiles for select
  using (id = auth.uid() or public.current_user_role() = 'diretor');

drop policy if exists "Diretores atualizam perfis" on public.profiles;
create policy "Diretores atualizam perfis"
  on public.profiles for update
  using (public.current_user_role() = 'diretor')
  with check (public.current_user_role() = 'diretor');

update public.profiles
set role = 'diretor'
where lower(email) = 'leandro7teixeita@gmail.com';

alter table public.match_results enable row level security;

drop policy if exists "Leitura pública dos placares" on public.match_results;
create policy "Leitura pública dos placares"
  on public.match_results for select
  using (true);

drop policy if exists "Escrita pública dos placares" on public.match_results;
drop policy if exists "Staff lança placares" on public.match_results;
drop policy if exists "Staff atualiza placares" on public.match_results;
drop policy if exists "Staff remove placares" on public.match_results;

create policy "Staff lança placares"
  on public.match_results for insert
  with check (public.current_user_role() in ('assessor', 'diretor'));

create policy "Staff atualiza placares"
  on public.match_results for update
  using (public.current_user_role() in ('assessor', 'diretor'))
  with check (public.current_user_role() in ('assessor', 'diretor'));

create policy "Staff remove placares"
  on public.match_results for delete
  using (public.current_user_role() in ('assessor', 'diretor'));

create table if not exists public.match_schedule (
  match_id text primary key,
  date text,
  time text,
  venue text,
  updated_at timestamptz not null default now()
);

alter table public.match_schedule enable row level security;

drop policy if exists "Leitura pública da agenda" on public.match_schedule;
create policy "Leitura pública da agenda"
  on public.match_schedule for select
  using (true);

drop policy if exists "Diretores atualizam agenda" on public.match_schedule;
drop policy if exists "Diretores inserem agenda" on public.match_schedule;
drop policy if exists "Diretores removem agenda" on public.match_schedule;

create policy "Diretores inserem agenda"
  on public.match_schedule for insert
  with check (public.current_user_role() = 'diretor');

create policy "Diretores atualizam agenda"
  on public.match_schedule for update
  using (public.current_user_role() = 'diretor')
  with check (public.current_user_role() = 'diretor');

create policy "Diretores removem agenda"
  on public.match_schedule for delete
  using (public.current_user_role() = 'diretor');

create table if not exists public.swimming_results (
  event_id text not null,
  team_id text not null,
  time_cs integer,
  walkover boolean not null default false,
  dns boolean not null default false,
  tiebreak integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (event_id, team_id)
);

alter table public.swimming_results enable row level security;

drop policy if exists "Leitura pública da natação" on public.swimming_results;
create policy "Leitura pública da natação"
  on public.swimming_results for select
  using (true);

drop policy if exists "Staff lança natação" on public.swimming_results;
drop policy if exists "Staff atualiza natação" on public.swimming_results;
drop policy if exists "Staff remove natação" on public.swimming_results;

create policy "Staff lança natação"
  on public.swimming_results for insert
  with check (public.current_user_role() in ('assessor', 'diretor'));

create policy "Staff atualiza natação"
  on public.swimming_results for update
  using (public.current_user_role() in ('assessor', 'diretor'))
  with check (public.current_user_role() in ('assessor', 'diretor'));

create policy "Staff remove natação"
  on public.swimming_results for delete
  using (public.current_user_role() in ('assessor', 'diretor'));
