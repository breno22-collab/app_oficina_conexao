-- Oficina Conexão — tabela mínima para o teste de cadastro de nomes.
-- Aplicado no projeto Supabase nomes_teste.

create table if not exists public.nomes_teste (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.nomes_teste enable row level security;

grant select, insert on public.nomes_teste to anon, authenticated;

drop policy if exists "Leitura publica para teste" on public.nomes_teste;
create policy "Leitura publica para teste"
  on public.nomes_teste
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Cadastro publico para teste" on public.nomes_teste;
create policy "Cadastro publico para teste"
  on public.nomes_teste
  for insert
  to anon, authenticated
  with check (char_length(trim(nome)) between 1 and 120);
