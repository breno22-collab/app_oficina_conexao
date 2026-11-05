import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowDownToLine,
  Check,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Database,
  Home,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Settings,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';

const navigation = [
  { id: 'inicio', label: 'Visão geral', icon: Home },
  { id: 'nomes', label: 'Nomes cadastrados', icon: Users },
  { id: 'auditorias', label: 'Auditoria do sistema', icon: ClipboardCheck },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

function App() {
  const [activePage, setActivePage] = useState('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [nomes, setNomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [auditorias, setAuditorias] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');

  const loadNames = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('nomes_teste')
      .select('id, nome, created_at')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError('Não foi possível carregar os nomes. Confira se a tabela nomes_teste foi criada no Supabase.');
    } else {
      setNomes(data ?? []);
    }
    setLoading(false);
  }, []);

  const loadAudits = useCallback(async () => {
    if (!supabase) return;
    setAuditLoading(true);
    setAuditError('');
    const { data, error: queryError } = await supabase
      .from('auditorias_sistema')
      .select('id, executed_at, status, total_records, checked_records, findings, duration_ms')
      .order('executed_at', { ascending: false })
      .limit(12);

    if (queryError) {
      setAuditError('Não foi possível consultar o histórico de auditorias.');
    } else {
      setAuditorias(data ?? []);
    }
    setAuditLoading(false);
  }, []);

  useEffect(() => {
    loadNames();
    loadAudits();
  }, [loadNames, loadAudits]);

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanName = nome.trim();
    if (!cleanName || !supabase) return;

    setSaving(true);
    setMessage('');
    setError('');

    const { error: insertError } = await supabase
      .from('nomes_teste')
      .insert({ nome: cleanName });

    if (insertError) {
      setError('Não foi possível salvar. Verifique a tabela e as permissões do Supabase.');
    } else {
      setNome('');
      setMessage('Nome salvo com sucesso!');
      await loadNames();
    }
    setSaving(false);
  }

  function navigate(page) {
    setActivePage(page);
    setMobileMenuOpen(false);
    setMessage('');
    setError('');
  }

  const pageTitle = navigation.find((item) => item.id === activePage)?.label ?? 'Visão geral';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Wrench size={21} strokeWidth={2.4} /></div>
          <div className="brand-copy">
            <strong>Oficina Conexão</strong>
            <span>APLICATIVO DE TESTE</span>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu">
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">MENU PRINCIPAL</div>
        <nav className="side-nav" aria-label="Menu lateral">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${activePage === id ? 'active' : ''}`} onClick={() => navigate(id)}>
              <Icon size={18} />
              <span>{label}</span>
              {id === 'nomes' && <span className="nav-count">{nomes.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Ambiente de teste</strong>
            <p>Este painel é uma primeira versão para validar a navegação e o banco de dados.</p>
          </div>
          <div className="profile">
            <div className="avatar">OC</div>
            <div className="profile-info"><strong>Oficina Conexão</strong><span>Administrador</span></div>
            <MoreHorizontal size={19} className="profile-more" />
          </div>
        </div>
      </aside>

      {mobileMenuOpen && <button className="mobile-scrim" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu" />}

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
              <Menu size={21} />
            </button>
            <div className="breadcrumb"><span>Painel</span><ChevronRight size={15} /><strong>{pageTitle}</strong></div>
          </div>
          <div className="topbar-right">
            <div className={`connection-pill ${isSupabaseConfigured ? 'connected' : 'disconnected'}`}>
              <span className="status-dot" />
              {isSupabaseConfigured ? 'Supabase configurado' : 'Banco não configurado'}
            </div>
            <div className="topbar-avatar">OC</div>
          </div>
        </header>

        <main className="content">
          {activePage === 'inicio' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">OFICINA CONEXÃO / TESTE 01</div>
                  <h1>Visão geral</h1>
                  <p>Um ambiente simples para testar a navegação e a conexão com o banco de dados.</p>
                </div>
                <div className="heading-mark"><Activity size={22} /></div>
              </div>

              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top"><span>Registros salvos</span><div className="stat-icon purple"><Users size={18} /></div></div>
                  <strong className="stat-value">{nomes.length}</strong>
                  <span className="stat-foot">Nomes na tabela de teste</span>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Banco de dados</span><div className="stat-icon green"><Database size={18} /></div></div>
                  <strong className="stat-value stat-status">{isSupabaseConfigured ? 'Configurado' : 'Pendente'}</strong>
                  <span className="stat-foot">{isSupabaseConfigured ? 'Variáveis de ambiente encontradas' : 'Aguardando as chaves do Supabase'}</span>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Aplicação</span><div className="stat-icon blue"><Activity size={18} /></div></div>
                  <strong className="stat-value stat-status">Online</strong>
                  <span className="stat-foot">Interface React carregada</span>
                </article>
              </section>

              <section className="panel form-panel">
                <div className="panel-heading">
                  <div><div className="eyebrow">CADASTRO RÁPIDO</div><h2>Adicionar um nome</h2><p>Digite um nome para testar a gravação no Supabase.</p></div>
                  <div className="panel-icon"><Plus size={20} /></div>
                </div>
                <form className="name-form" onSubmit={handleSubmit}>
                  <label htmlFor="nome">Nome</label>
                  <div className="input-row">
                    <input id="nome" name="nome" value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Digite o nome aqui..." autoComplete="name" maxLength={100} required />
                    <button className="primary-button" type="submit" disabled={!isSupabaseConfigured || saving || !nome.trim()}>
                      {saving ? <RefreshCw size={17} className="spin" /> : <ArrowDownToLine size={17} />}
                      {saving ? 'Salvando...' : 'Salvar nome'}
                    </button>
                  </div>
                  {!isSupabaseConfigured && <div className="inline-note"><Database size={15} /> Configure as variáveis do Supabase para habilitar o cadastro.</div>}
                  {message && <div className="success-message"><Check size={16} />{message}</div>}
                  {error && <div className="error-message">{error}</div>}
                </form>
              </section>

              <NamesPanel nomes={nomes} loading={loading} onRefresh={loadNames} />
            </>
          )}

          {activePage === 'nomes' && (
            <>
              <div className="page-heading">
                <div><div className="eyebrow">DADOS DO APLICATIVO</div><h1>Nomes cadastrados</h1><p>Registros enviados para a tabela de teste do Supabase.</p></div>
                <button className="secondary-button" onClick={loadNames}><RefreshCw size={16} /> Atualizar</button>
              </div>
              <NamesPanel nomes={nomes} loading={loading} onRefresh={loadNames} />
            </>
          )}

          {activePage === 'auditorias' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">MONITORAMENTO AUTOMÁTICO</div>
                  <h1>Auditoria do sistema</h1>
                  <p>Verificação semanal da conexão, da tabela e da consistência dos cadastros.</p>
                </div>
                <button className="secondary-button" onClick={loadAudits} disabled={auditLoading}>
                  <RefreshCw size={16} className={auditLoading ? 'spin' : ''} /> Atualizar
                </button>
              </div>
              <AuditPanel auditorias={auditorias} loading={auditLoading} error={auditError} />
            </>
          )}

          {activePage === 'configuracoes' && (
            <>
              <div className="page-heading"><div><div className="eyebrow">SISTEMA</div><h1>Configurações</h1><p>Informações técnicas do ambiente de teste.</p></div></div>
              <section className="panel settings-panel">
                <div className="setting-row"><div className="setting-icon"><Database size={19} /></div><div className="setting-copy"><strong>Supabase</strong><span>Conexão com banco de dados</span></div><span className={`setting-state ${isSupabaseConfigured ? 'ok' : ''}`}>{isSupabaseConfigured ? 'Configurado' : 'Pendente'}</span></div>
                <div className="setting-row"><div className="setting-icon"><Activity size={19} /></div><div className="setting-copy"><strong>React</strong><span>Interface da aplicação</span></div><span className="setting-state ok">Ativo</span></div>
                <div className="setting-row"><div className="setting-icon"><Wrench size={19} /></div><div className="setting-copy"><strong>Projeto</strong><span>Oficina Conexão — ambiente de teste</span></div><span className="setting-state ok">Inicializado</span></div>
                <div className="setting-row"><div className="setting-icon"><ClipboardCheck size={19} /></div><div className="setting-copy"><strong>Auditoria automática</strong><span>Segundas-feiras, às 08h (horário de Porto Velho)</span></div><span className="setting-state ok">Semanal</span></div>
              </section>
            </>
          )}
        </main>

        <footer className="bottom-nav" aria-label="Navegação inferior">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={activePage === id ? 'bottom-item active' : 'bottom-item'} onClick={() => navigate(id)}>
              <Icon size={19} /><span>{id === 'inicio' ? 'Início' : id === 'nomes' ? 'Nomes' : id === 'configuracoes' ? 'Ajustes' : 'Auditoria'}</span>
            </button>
          ))}
        </footer>
        <div className="desktop-footer"><span>© 2026 Oficina Conexão</span><span>Ambiente de demonstração <span className="footer-dot">•</span> v1.0.0</span></div>
      </div>
    </div>
  );
}

function NamesPanel({ nomes, loading, onRefresh }) {
  return (
    <section className="panel names-panel">
      <div className="panel-heading compact">
        <div><div className="eyebrow">ÚLTIMOS REGISTROS</div><h2>Lista de nomes</h2></div>
        <button className="icon-button refresh-button" onClick={onRefresh} aria-label="Atualizar lista"><RefreshCw size={17} /></button>
      </div>
      {!isSupabaseConfigured ? (
        <div className="empty-state"><div className="empty-icon"><Database size={23} /></div><strong>Conexão aguardando configuração</strong><p>Quando as chaves do Supabase forem adicionadas, os registros aparecerão aqui.</p></div>
      ) : loading ? (
        <div className="empty-state"><RefreshCw size={22} className="spin" /><p>Carregando registros...</p></div>
      ) : nomes.length === 0 ? (
        <div className="empty-state"><div className="empty-icon"><Users size={23} /></div><strong>Nenhum nome cadastrado</strong><p>Use o formulário acima para adicionar o primeiro registro.</p></div>
      ) : (
        <div className="table-wrap"><table><thead><tr><th>Nome</th><th>Data de cadastro</th></tr></thead><tbody>{nomes.map((item) => <tr key={item.id}><td><span className="name-avatar">{item.nome.slice(0, 1).toUpperCase()}</span>{item.nome}</td><td>{new Date(item.created_at).toLocaleString('pt-BR')}</td></tr>)}</tbody></table></div>
      )}
    </section>
  );
}

function AuditPanel({ auditorias, loading, error }) {
  const statusLabel = (status) => (
    status === 'ok' ? 'Sem inconsistências' : status === 'warning' ? 'Atenção necessária' : 'Falha na verificação'
  );
  const statusClass = (status) => status === 'ok' ? 'audit-ok' : status === 'warning' ? 'audit-warning' : 'audit-error';

  return (
    <>
      <section className="panel audit-intro">
        <div className="audit-intro-icon"><ClipboardCheck size={22} /></div>
        <div>
          <strong>Rotina semanal ativada</strong>
          <p>A aplicação executa a auditoria toda segunda-feira às 08h, no horário de Porto Velho. A primeira execução ocorrerá no próximo ciclo agendado após a publicação.</p>
        </div>
      </section>

      <section className="panel names-panel">
        <div className="panel-heading compact">
          <div><div className="eyebrow">RESULTADOS RECENTES</div><h2>Histórico de auditorias</h2></div>
          <span className="audit-frequency">1 vez por semana</span>
        </div>
        {error ? (
          <div className="empty-state"><div className="empty-icon"><Database size={23} /></div><strong>Histórico indisponível</strong><p>{error}</p></div>
        ) : loading ? (
          <div className="empty-state"><RefreshCw size={22} className="spin" /><p>Consultando auditorias...</p></div>
        ) : auditorias.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"><ClipboardCheck size={23} /></div><strong>Ainda não há auditorias registradas</strong><p>A primeira verificação será registrada automaticamente na próxima segunda-feira, às 08h.</p></div>
        ) : (
          <div className="audit-list">
            {auditorias.map((audit) => (
              <article className="audit-entry" key={audit.id}>
                <div className="audit-entry-top">
                  <div>
                    <strong>{new Date(audit.executed_at).toLocaleString('pt-BR')}</strong>
                    <span>{audit.checked_records} registro(s) verificado(s)</span>
                  </div>
                  <span className={`audit-status ${statusClass(audit.status)}`}>{statusLabel(audit.status)}</span>
                </div>
                {Array.isArray(audit.findings) && audit.findings.length > 0 ? (
                  <ul className="audit-findings">
                    {audit.findings.map((finding, index) => (
                      <li key={finding.code || index}>
                        <span className={`finding-severity ${finding.severity === 'critical' ? 'critical' : 'warning'}`} />
                        <span>{finding.message}</span>
                        {finding.count > 0 && <b>{finding.count}</b>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="audit-clean"><Check size={15} /> Nenhuma inconsistência encontrada.</p>
                )}
                <div className="audit-meta">
                  <span>{audit.total_records} registro(s) no total</span>
                  <span>{audit.duration_ms} ms</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default App;
