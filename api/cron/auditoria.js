import { createClient } from '@supabase/supabase-js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const normalizeName = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLocaleLowerCase('pt-BR');

export async function GET(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return json({ success: false, message: 'Não autorizado.' }, 401);
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const auditWriteToken = process.env.AUDIT_WRITE_TOKEN;

  if (!supabaseUrl || !supabaseKey || !auditWriteToken) {
    console.error('[auditoria] Variáveis obrigatórias ausentes.');
    return json({ success: false, message: 'Configuração da auditoria incompleta.' }, 500);
  }

  const startedAt = Date.now();
  const findings = [];
  let rows = [];
  let scanFailed = false;
  const pageSize = 500;
  const maxRows = 10000;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-audit-write-token': auditWriteToken } },
  });

  try {
    for (let offset = 0; offset < maxRows; offset += pageSize) {
      const { data, error } = await supabase
        .from('nomes_teste')
        .select('id, nome, created_at')
        .order('created_at', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) {
        scanFailed = true;
        findings.push({
          code: 'TABLE_UNAVAILABLE',
          severity: 'critical',
          message: 'Não foi possível consultar a tabela nomes_teste: ' + error.message,
          count: 1,
        });
        break;
      }

      rows = rows.concat(data || []);
      if (!data || data.length < pageSize) break;
      if (offset + pageSize >= maxRows) {
        findings.push({
          code: 'SCAN_LIMIT_REACHED',
          severity: 'warning',
          message: 'A auditoria atingiu o limite de 10.000 registros; há dados que podem não ter sido verificados.',
          count: rows.length,
        });
      }
    }

    if (!scanFailed) {
      const blankNames = rows.filter((row) => typeof row.nome !== 'string' || !row.nome.trim()).length;
      if (blankNames) findings.push({
        code: 'EMPTY_NAMES',
        severity: 'warning',
        message: 'Foram encontrados cadastros com nome vazio ou composto apenas por espaços.',
        count: blankNames,
      });

      const duplicateGroups = new Map();
      for (const row of rows) {
        if (typeof row.nome !== 'string' || !row.nome.trim()) continue;
        const key = normalizeName(row.nome);
        duplicateGroups.set(key, (duplicateGroups.get(key) || 0) + 1);
      }
      const duplicateRows = [...duplicateGroups.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);
      if (duplicateRows) findings.push({
        code: 'POSSIBLE_DUPLICATES',
        severity: 'warning',
        message: 'Há nomes repetidos considerando diferenças de maiúsculas, acentos e espaços.',
        count: duplicateRows,
      });

      const invalidDates = rows.filter((row) => !row.created_at || !Number.isFinite(Date.parse(row.created_at))).length;
      if (invalidDates) findings.push({
        code: 'INVALID_DATES',
        severity: 'warning',
        message: 'Foram encontrados registros sem uma data de cadastro válida.',
        count: invalidDates,
      });

      const futureDates = rows.filter((row) => {
        const timestamp = Date.parse(row.created_at);
        return Number.isFinite(timestamp) && timestamp > Date.now() + 5 * 60 * 1000;
      }).length;
      if (futureDates) findings.push({
        code: 'FUTURE_DATES',
        severity: 'warning',
        message: 'Foram encontrados registros com data de cadastro no futuro.',
        count: futureDates,
      });
    }

    const status = findings.some((item) => item.severity === 'critical')
      ? 'error'
      : findings.length ? 'warning' : 'ok';
    const report = {
      status,
      total_records: rows.length,
      checked_records: rows.length,
      findings,
      duration_ms: Date.now() - startedAt,
    };

    const { error: saveError } = await supabase.from('auditorias_sistema').insert(report);
    if (saveError) {
      console.error('[auditoria] Não foi possível gravar o relatório:', saveError.message);
      return json({ success: false, report, storage_error: saveError.message }, 500);
    }

    console.log('[auditoria] Verificação concluída:', JSON.stringify({
      status,
      checked_records: report.checked_records,
      findings: findings.map(({ code, severity, count }) => ({ code, severity, count })),
      duration_ms: report.duration_ms,
    }));

    return json({ success: true, report });
  } catch (error) {
    console.error('[auditoria] Falha inesperada:', error);
    return json({ success: false, message: 'Falha inesperada durante a auditoria.' }, 500);
  }
}
