import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowDownToLine,
  Check,
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

  useEffect(() => {
    loadNames();
  }, [loadNames]);

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

          {activePage === 'configuracoes' && (
            <>
              <div className="page-heading"><div><div className="eyebrow">SISTEMA</div><h1>Configurações</h1><p>Informações técnicas do ambiente de teste.</p></div></div>
              <section className="panel settings-panel">
                <div className="setting-row"><div className="setting-icon"><Database size={19} /></div><div className="setting-copy"><strong>Supabase</strong><span>Conexão com banco de dados</span></div><span className={`setting-state ${isSupabaseConfigured ? 'ok' : ''}`}>{isSupabaseConfigured ? 'Configurado' : 'Pendente'}</span></div>
                <div className="setting-row"><div className="setting-icon"><Activity size={19} /></div><div className="setting-copy"><strong>React</strong><span>Interface da aplicação</span></div><span className="setting-state ok">Ativo</span></div>
                <div className="setting-row"><div className="setting-icon"><Wrench size={19} /></div><div className="setting-copy"><strong>Projeto</strong><span>Oficina Conexão — ambiente de teste</span></div><span className="setting-state ok">Inicializado</span></div>
              </section>
            </>
          )}
        </main>

        <footer className="bottom-nav" aria-label="Navegação inferior">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={activePage === id ? 'bottom-item active' : 'bottom-item'} onClick={() => navigate(id)}>
              <Icon size={19} /><span>{id === 'inicio' ? 'Início' : id === 'nomes' ? 'Nomes' : 'Ajustes'}</span>
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

export default App;
