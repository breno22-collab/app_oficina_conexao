-- Oficina Conexão — tabela mínima para o teste de cadastro de nomes.
-- Execute este script no SQL Editor do projeto Supabase depois de reativá-lo.

create table if not exists public.nomes_teste (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) between 1 and 100),
  created_at timestamptz not null default now()
);

alter table public.nomes_teste enable row level security;

grant select, insert on public.nomes_teste to anon, authenticated;

drop policy if exists "Leitura pública dos nomes de teste" on public.nomes_teste;
create policy "Leitura pública dos nomes de teste"
  on public.nomes_teste
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Cadastro público de nomes de teste" on public.nomes_teste;
create policy "Cadastro público de nomes de teste"
  on public.nomes_teste
  for insert
  to anon, authenticated
  with check (char_length(trim(nome)) between 1 and 100);
