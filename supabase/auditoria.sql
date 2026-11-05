-- Auditoria semanal do Oficina Conexão.
-- Antes de executar, substitua __AUDIT_WRITE_TOKEN__ por um token aleatório
-- forte, igual ao valor guardado na variável AUDIT_WRITE_TOKEN da Vercel.
-- Nunca use a chave service_role no navegador.

create table if not exists public.auditorias_sistema (
  id uuid primary key default gen_random_uuid(),
  executed_at timestamptz not null default now(),
  status text not null check (status in ('ok', 'warning', 'error')),
  total_records integer not null default 0,
  checked_records integer not null default 0,
  findings jsonb not null default '[]'::jsonb,
  duration_ms integer not null default 0
);

alter table public.auditorias_sistema enable row level security;
grant select, insert on public.auditorias_sistema to anon, authenticated;

drop policy if exists "Leitura publica do historico de auditoria" on public.auditorias_sistema;
create policy "Leitura publica do historico de auditoria"
  on public.auditorias_sistema for select
  to anon, authenticated
  using (true);

drop policy if exists "Gravacao protegida pela rotina automatica" on public.auditorias_sistema;
create policy "Gravacao protegida pela rotina automatica"
  on public.auditorias_sistema for insert
  to anon, authenticated
  with check (
    coalesce(current_setting('request.headers', true)::jsonb ->> 'x-audit-write-token', '')
      = '__AUDIT_WRITE_TOKEN__'
  );
